import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTH_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const WEEK_DAYS   = ["L","M","X","J","V","S","D"];
const TODAY       = new Date();
const TODAY_STR   = `${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,"0")}-${String(TODAY.getDate()).padStart(2,"0")}`;

function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
	return (
		<label htmlFor={htmlFor} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
			{children}
		</label>
	);
}

export function DatePickerSA({
	id,
	label,
	value,
	onChange,
	error,
	disabled,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	disabled?: boolean;
}) {
	type CalendarView = "days" | "months" | "years";

	const parsed      = value ? new Date(value + "T00:00:00") : null;
	const validParsed = parsed && !isNaN(parsed.getTime()) ? parsed : null;

	const [open, setOpen]           = useState(false);
	const [closing, setClosing]     = useState(false);
	const [viewMode, setViewMode]   = useState<CalendarView>("days");
	const [viewYear, setViewYear]   = useState(() => validParsed?.getFullYear() ?? TODAY.getFullYear());
	const [viewMonth, setViewMonth] = useState(() => validParsed?.getMonth() ?? TODAY.getMonth());
	const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
	const [openUpward, setOpenUpward] = useState(false);
	const containerRef              = useRef<HTMLDivElement>(null);
	const dropdownRef               = useRef<HTMLDivElement>(null);

	const displayValue = validParsed
		? `${String(validParsed.getDate()).padStart(2,"0")}/${String(validParsed.getMonth()+1).padStart(2,"0")}/${validParsed.getFullYear()}`
		: null;

	useEffect(() => {
		if (!value) { setViewYear(TODAY.getFullYear()); setViewMonth(TODAY.getMonth()); return; }
		const d = new Date(value + "T00:00:00");
		if (!isNaN(d.getTime())) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
	}, [value]);

	function closeCalendar() {
		setClosing(true);
		setTimeout(() => { setOpen(false); setClosing(false); setViewMode("days"); }, 120);
	}

	function updateDropdownPosition() {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const width = 288;
		// Conservative estimate for the tallest calendar view (days view with 6 rows)
		const estimatedHeight = 320;
		const gap = 4;
		const margin = 8;

		const spaceBelow = window.innerHeight - rect.bottom - gap;
		const spaceAbove = rect.top - gap;
		const shouldOpenUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

		const left = Math.min(
			Math.max(rect.left + rect.width / 2 - width / 2, margin),
			window.innerWidth - width - margin,
		);

		setOpenUpward(shouldOpenUpward);
		setDropdownStyle({
			position: "fixed",
			...(shouldOpenUpward
				? { bottom: window.innerHeight - rect.top + gap }
				: { top: rect.bottom + gap }
			),
			left,
			width,
			zIndex: 70,
		});
	}

	useEffect(() => {
		if (!open) return;
		function handleOutside(e: MouseEvent) {
			const target = e.target as Node;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				!dropdownRef.current?.contains(target)
			) closeCalendar();
		}
		window.addEventListener("resize", updateDropdownPosition);
		window.addEventListener("scroll", updateDropdownPosition, true);
		document.addEventListener("mousedown", handleOutside);
		return () => {
			window.removeEventListener("resize", updateDropdownPosition);
			window.removeEventListener("scroll", updateDropdownPosition, true);
			document.removeEventListener("mousedown", handleOutside);
		};
	}, [open]);

	function prevPeriod() {
		if (viewMode === "days") { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y-1); } else setViewMonth((m) => m-1); }
		else if (viewMode === "months") setViewYear((y) => y-1);
		else setViewYear((y) => y-12);
	}

	function nextPeriod() {
		if (viewMode === "days") { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y+1); } else setViewMonth((m) => m+1); }
		else if (viewMode === "months") setViewYear((y) => y+1);
		else setViewYear((y) => y+12);
	}

	const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
	const startOffset = (firstDay + 6) % 7;
	const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
	const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

	type DayCell = { day: number; month: number; year: number; current: boolean };
	const cells: DayCell[] = [];
	for (let i = startOffset-1; i >= 0; i--) {
		const m = viewMonth === 0 ? 11 : viewMonth-1;
		const y = viewMonth === 0 ? viewYear-1 : viewYear;
		cells.push({ day: daysInPrev-i, month: m, year: y, current: false });
	}
	for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: viewMonth, year: viewYear, current: true });
	const totalCells = Math.ceil(cells.length/7)*7;
	for (let d = 1; d <= totalCells-cells.length; d++) {
		const nm = viewMonth === 11 ? 0 : viewMonth+1;
		const ny = viewMonth === 11 ? viewYear+1 : viewYear;
		cells.push({ day: d, month: nm, year: ny, current: false });
	}

	function cellDateStr(cell: DayCell) {
		return `${cell.year}-${String(cell.month+1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
	}

	const yearStart = Math.floor(viewYear/12)*12;

	function headerLabel() {
		if (viewMode === "days")   return `${MONTH_NAMES[viewMonth]} ${viewYear}`;
		if (viewMode === "months") return `${viewYear}`;
		return `${yearStart} – ${yearStart+11}`;
	}

	const triggerClass = [
		"mt-1 flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm text-left transition outline-none",
		disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-gray-400",
		error ? "border-red-300" : open ? "border-slate-400 ring-2 ring-slate-200" : "border-gray-300",
	].join(" ");

	const animationClass = closing
		? (openUpward ? "animate-dropdown-out-up" : "animate-dropdown-out")
		: (openUpward ? "animate-dropdown-in-up" : "animate-dropdown-in");

	return (
		<div ref={containerRef} className="relative">
			<Label htmlFor={id}>{label}</Label>
			<button
				id={id}
				type="button"
				disabled={disabled}
				onClick={() => {
					if (disabled) return;
					if (open) {
						closeCalendar();
					} else {
						updateDropdownPosition();
						setOpen(true);
					}
				}}
				className={triggerClass}
			>
				<span className={displayValue ? "text-gray-900" : "text-neutral-400"}>
					{displayValue ?? "dd/mm/aaaa"}
				</span>
				<CalendarDaysIcon className="h-4 w-4 shrink-0 text-neutral-400" />
			</button>

			{(open || closing) && createPortal(
				<div ref={dropdownRef} style={dropdownStyle} className={`rounded-lg border border-gray-300 bg-white shadow-lg ${animationClass}`}>
					<div className="flex items-center justify-between border-b border-gray-200 px-2 py-2">
						<button type="button" onMouseDown={(e) => e.preventDefault()} onClick={prevPeriod}
							className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-gray-100 hover:text-gray-700">
							<ChevronLeftIcon className="h-4 w-4" />
						</button>
						<button type="button" onMouseDown={(e) => e.preventDefault()}
							onClick={() => { if (viewMode === "days") setViewMode("months"); else if (viewMode === "months") setViewMode("years"); }}
							className={["rounded-lg px-2 py-1 text-sm font-semibold text-gray-600 transition", viewMode !== "years" ? "hover:bg-gray-100" : "cursor-default"].join(" ")}>
							{headerLabel()}
						</button>
						<button type="button" onMouseDown={(e) => e.preventDefault()} onClick={nextPeriod}
							className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-gray-100 hover:text-gray-700">
							<ChevronRightIcon className="h-4 w-4" />
						</button>
					</div>

					{viewMode === "days" && (
						<>
							<div className="grid grid-cols-7 px-2 pt-2">
								{WEEK_DAYS.map((d) => (
									<div key={d} className="flex h-7 items-center justify-center text-xs font-semibold text-neutral-400">{d}</div>
								))}
							</div>
							<div className="grid grid-cols-7 px-2 pb-2">
								{cells.map((cell, i) => {
									const dateStr    = cellDateStr(cell);
									const isSelected = dateStr === value;
									const isToday    = dateStr === TODAY_STR;
									return (
										<div key={i} className="flex items-center justify-center py-0.5">
											<button type="button" onMouseDown={(e) => e.preventDefault()}
												onClick={() => { onChange(dateStr); closeCalendar(); }}
												className={["h-8 w-8 flex items-center justify-center rounded-lg text-xs transition",
													isSelected
														? "bg-slate-100 font-semibold text-slate-700 ring-1 ring-slate-300"
														: isToday
															? "font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50"
															: cell.current
																? "text-gray-900 hover:bg-gray-100"
																: "text-neutral-400 hover:bg-gray-100",
												].join(" ")}>
												{cell.day}
											</button>
										</div>
									);
								})}
							</div>
						</>
					)}

					{viewMode === "months" && (
						<div className="grid grid-cols-3 gap-1 p-3">
							{MONTH_SHORT.map((name, i) => {
								const isSelected = validParsed?.getMonth() === i && validParsed?.getFullYear() === viewYear;
								const isCurrent  = TODAY.getMonth() === i && TODAY.getFullYear() === viewYear;
								return (
									<button key={i} type="button" onMouseDown={(e) => e.preventDefault()}
										onClick={() => { setViewMonth(i); setViewMode("days"); }}
										className={["rounded-lg py-2 text-sm transition",
											isSelected ? "bg-slate-100 font-semibold text-slate-700 ring-1 ring-slate-300"
											: isCurrent ? "font-semibold text-slate-600 hover:bg-slate-50"
											: "text-gray-900 hover:bg-gray-100",
										].join(" ")}>
										{name}
									</button>
								);
							})}
						</div>
					)}

					{viewMode === "years" && (
						<div className="grid grid-cols-3 gap-1 p-3">
							{Array.from({ length: 12 }, (_, i) => yearStart+i).map((year) => {
								const isSelected = validParsed?.getFullYear() === year;
								const isCurrent  = TODAY.getFullYear() === year;
								return (
									<button key={year} type="button" onMouseDown={(e) => e.preventDefault()}
										onClick={() => { setViewYear(year); setViewMode("months"); }}
										className={["rounded-lg py-2 text-sm transition",
											isSelected ? "bg-slate-100 font-semibold text-slate-700 ring-1 ring-slate-300"
											: isCurrent ? "font-semibold text-slate-600 hover:bg-slate-50"
											: "text-gray-900 hover:bg-gray-100",
										].join(" ")}>
										{year}
									</button>
								);
							})}
						</div>
					)}
				</div>,
				document.body,
			)}

			{error && (
				<p className="mt-1 inline-flex items-center gap-1 text-xs text-red-700">
					<ExclamationCircleIcon className="h-4 w-4 shrink-0" />
					{error}
				</p>
			)}
		</div>
	);
}
