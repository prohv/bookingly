export default function Loader() {
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse text-sm">
                Loading...
            </p>
        </div>
    )
}
