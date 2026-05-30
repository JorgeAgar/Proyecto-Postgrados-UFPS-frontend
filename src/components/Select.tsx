import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export type SelectOption = { value: string; label: string };

function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
	return (
		<label htmlFor={htmlFor} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
			{children}
		</label>
	);
}

function Spinner() {
	return (
		<svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

export function Select({
	id,
	label,
	value,
	onChange,
	options,
	error,
	loading,
	disabled,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	error?: string;
	loading?: boolean;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [closing, setClosing] = useState(false);
	const [search, setSearch] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const isDisabled = loading || disabled;
	const selectedLabel = options.find((o) => o.value === value)?.label;
	const filteredOptions = search.trim()
		? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
		: options;

	function closeDropdown() {
		setClosing(true);
		setTimeout(() => {
			setOpen(false);
			setClosing(false);
			setSearch("");
		}, 120);
	}

	useEffect(() => {
		if (!open) return;
		triggerRef.current?.focus();
		function handleOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				closeDropdown();
			}
		}
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, [open]);

	function handleToggle() {
		if (isDisabled) return;
		if (open) closeDropdown();
		else setOpen(true);
	}

	function handleSelect(optionValue: string) {
		onChange(optionValue);
		closeDropdown();
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
		if (!open) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
				e.preventDefault();
				setOpen(true);
			}
			return;
		}

		if (e.key === "Escape") {
			e.preventDefault();
			closeDropdown();
			return;
		}

		if (e.key === "Backspace") {
			e.preventDefault();
			setSearch((s) => s.slice(0, -1));
			return;
		}

		if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			setSearch((s) => s + e.key);
		}
	}

	const triggerClass = [
		"mt-1 flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm text-left transition outline-none",
		isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-gray-300",
		error ? "border-red-200" : open ? "border-red-300 ring-2 ring-red-200" : "border-gray-200",
	].join(" ");

	return (
		<div ref={containerRef} className="relative">
			<Label htmlFor={id}>{label}</Label>
			<button
				ref={triggerRef}
				id={id}
				type="button"
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				disabled={isDisabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				className={triggerClass}
			>
				{loading ? (
					<span className="flex items-center gap-2 text-neutral-400">
						<Spinner />
						Cargando opciones...
					</span>
				) : (
					<span className={value && selectedLabel ? "text-gray-900" : "text-neutral-400"}>
						{selectedLabel ?? "Selecciona una opción"}
					</span>
				)}
				<ChevronDownIcon className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
			</button>

			{(open || closing) && (
				<ul
					role="listbox"
					className={`absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg ${closing ? "animate-dropdown-out" : "animate-dropdown-in"}`}
				>
					{!search.trim() && (
						<li
							role="option"
							aria-selected={value === ""}
							onMouseDown={(e) => { e.preventDefault(); handleSelect(""); }}
							className={`cursor-pointer px-3 py-2 text-sm transition-colors ${value === "" ? "bg-red-100 font-medium text-red-700" : "text-neutral-400 hover:bg-gray-50"}`}
						>
							Selecciona una opción
						</li>
					)}
					{filteredOptions.length > 0 ? filteredOptions.map((option) => (
						<li
							key={option.value}
							role="option"
							aria-selected={value === option.value}
							onMouseDown={(e) => { e.preventDefault(); handleSelect(option.value); }}
							className={`cursor-pointer px-3 py-2 text-sm transition-colors ${value === option.value ? "bg-red-100 font-medium text-red-700" : "text-gray-900 hover:bg-gray-50"}`}
						>
							{option.label}
						</li>
					)) : (
						<li className="px-3 py-2 text-sm text-neutral-400">Sin resultados</li>
					)}
				</ul>
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
