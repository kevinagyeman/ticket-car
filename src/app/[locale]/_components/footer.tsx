export function Footer() {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-30 border-border border-t-[3px] bg-background px-4 py-1 text-center text-[11px] text-muted-foreground">
			© {new Date().getFullYear()} ticket-car · Tutti i diritti sono riservati
		</footer>
	);
}
