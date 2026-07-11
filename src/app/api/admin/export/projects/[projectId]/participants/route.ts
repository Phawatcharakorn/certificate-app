import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/lib/supabase/require-admin";

interface ParticipantRow {
  status: string;
  joined_at: string;
  student: {
    student_code: string;
    full_name: string;
    faculty: { name: string } | null;
  } | null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const { supabase } = await requireAdmin();

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const { data: participations } = await supabase
    .from("participations")
    .select(
      "status, joined_at, student:students(student_code, full_name, faculty:faculties(name))",
    )
    .eq("project_id", projectId);

  const rows = ((participations as unknown as ParticipantRow[]) ?? []).map(
    (row) => ({
      รหัสนิสิต: row.student?.student_code,
      "ชื่อ-นามสกุล": row.student?.full_name,
      คณะ: row.student?.faculty?.name,
      สถานะ: row.status,
      วันที่เข้าร่วม: row.joined_at,
    }),
  );

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  const filename = `participants-${project?.name ?? projectId}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
