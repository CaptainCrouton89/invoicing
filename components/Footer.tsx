export default function Footer() {
  return (
    <footer className="w-full border-t border-t-foreground/10 mt-auto">
      <div className="container mx-auto py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} • Open-source and free forever</p>
      </div>
    </footer>
  );
}
