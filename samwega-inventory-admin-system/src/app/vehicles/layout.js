
import Header from "../../components/Header";
import AuthGuard from "../../components/AuthGuard";

export default function VehiclesLayout({ children }) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-10 pt-6 lg:px-8">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
