import AuthGuard from "@/components/AuthGuard";

export default function ReportsLayout({ children }) {
    return (
        <AuthGuard>
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-6 lg:px-8">
                {children}
            </main>
        </AuthGuard>
    );
}
