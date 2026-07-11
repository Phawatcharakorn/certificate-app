import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase } = await requireAdmin();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "code, name, event_date, location, duration, responsible_person, target_faculty_mode",
    )
    .order("event_date", { ascending: false });

  const rows = (projects ?? []).map((p) => ({
    รหัส: p.code,
    ชื่อโครงการ: p.name,
    วันที่: p.event_date,
    สถานที่: p.location,
    ระยะเวลา: p.duration,
    ผู้รับผิดชอบ: p.responsible_person,
    คณะที่เข้าร่วมได้:
      p.target_faculty_mode === "all" ? "ทุกคณะ" : "เฉพาะบางคณะ",
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="projects.xlsx"',
    },
  });
}
