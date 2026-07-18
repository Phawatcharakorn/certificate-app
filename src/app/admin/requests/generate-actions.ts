"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_LABEL } from "@/lib/certificate-tier";
import type { CertificateTier } from "@/types/database";

interface FieldPositions {
  full_name?: { x: number; y: number };
  student_code?: { x: number; y: number };
  certificate_name?: { x: number; y: number };
  date?: { x: number; y: number };
}

export async function generateCertificate(requestId: string) {
  const { supabase } = await requireAdmin();

  const { data: request, error: requestError } = await supabase
    .from("certificate_requests")
    .select(
      "id, student_id, period_id, student:students(full_name, student_code), period:academic_periods(name)",
    )
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    throw new Error("ไม่พบคำร้องนี้");
  }

  const { data: result } = await supabase
    .from("student_period_results")
    .select("tier")
    .eq("student_id", request.student_id)
    .eq("period_id", request.period_id)
    .maybeSingle();

  if (!result?.tier) {
    throw new Error("นิสิตยังไม่ผ่านเกณฑ์ขั้นต่ำสำหรับปีการศึกษานี้");
  }

  const tier = result.tier as CertificateTier;

  const { data: template } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("tier", tier)
    .maybeSingle();

  if (!template?.background_image_url) {
    throw new Error(
      `ยังไม่ได้ตั้งค่า template ใบเซอร์ระดับ ${TIER_LABEL[tier]} (ไปที่ /admin/settings)`,
    );
  }

  const imageResponse = await fetch(template.background_image_url);
  const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
  const contentType = imageResponse.headers.get("content-type") ?? "";

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const image = contentType.includes("png")
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const fontBytes = await readFile(
    path.join(process.cwd(), "public/fonts/NotoSansThai-Regular.ttf"),
  );
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });

  const positions = (template.field_positions ?? {}) as FieldPositions;
  const studentRow = request.student as unknown as {
    full_name: string;
    student_code: string;
  } | null;
  const periodRow = request.period as unknown as { name: string } | null;

  const fieldValues: Record<keyof FieldPositions, string> = {
    full_name: studentRow?.full_name ?? "",
    student_code: studentRow?.student_code ?? "",
    certificate_name: `${periodRow?.name ?? ""} — ${TIER_LABEL[tier]}`,
    date: new Date().toLocaleDateString("th-TH"),
  };

  for (const key of Object.keys(fieldValues) as (keyof FieldPositions)[]) {
    const pos = positions[key];
    if (!pos) continue;
    page.drawText(fieldValues[key], {
      x: pos.x,
      y: pos.y,
      size: 20,
      font,
    });
  }

  const pdfBytes = await pdfDoc.save();

  // Use the service-role client for the Storage write — Storage policies key
  // off auth.uid(), which server actions running under the admin's own
  // session already satisfy, but the service-role client avoids any ambiguity
  // around session propagation during long-running PDF generation.
  const adminClient = createAdminClient();
  const filePath = `${requestId}.pdf`;

  const { error: uploadError } = await adminClient.storage
    .from("certificates")
    .upload(filePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = adminClient.storage
    .from("certificates")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("certificate_requests")
    .update({
      status: "completed",
      certificate_file_url: publicUrlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/admin/requests");
  revalidatePath("/certificates");
}
