import { updateParticipationStatus } from "../actions";
import type { ParticipationStatus } from "@/types/database";
import type { ParticipationDetail } from "@/lib/queries/admin-student-detail";

const STATUS_OPTIONS: { value: ParticipationStatus; label: string }[] = [
  { value: "registered", label: "ลงทะเบียนแล้ว" },
  { value: "attended", label: "ผ่านแล้ว" },
  { value: "absent", label: "ขาดร่วม" },
];

const ACTIVE_STYLE: Record<ParticipationStatus, string> = {
  registered: "bg-blue-600 text-white",
  attended: "bg-green-600 text-white",
  absent: "bg-red-600 text-white",
};

export function ParticipationRow({
  studentId,
  participation,
}: {
  studentId: string;
  participation: ParticipationDetail;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-slate-900">
          {participation.project?.code} — {participation.project?.name}
        </p>
        <p className="text-xs text-slate-400">
          {participation.project?.event_date}
        </p>
      </div>
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((option) => (
          <form
            key={option.value}
            action={updateParticipationStatus.bind(
              null,
              studentId,
              participation.id,
              option.value,
            )}
          >
            <button
              type="submit"
              disabled={participation.status === option.value}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                participation.status === option.value
                  ? ACTIVE_STYLE[option.value]
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          </form>
        ))}
      </div>
    </li>
  );
}
