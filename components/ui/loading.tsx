export function Loading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-t-2 border-blue-500`}></div>
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0.2s" }}></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0.4s" }}></div>
    </div>
  )
} 