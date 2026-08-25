import Link from "next/link";

export function HomeNav() {
  return (
    <header className="home-glass border-border/50 sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span
            className="bg-accent text-accent-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
            aria-hidden
          >
            D
          </span>
          <span className="text-foreground text-lg font-semibold tracking-tight">
            DocShare
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors duration-200"
          >
            产品能力
          </a>
          <a
            href="#showcase"
            className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors duration-200"
          >
            文档精选
          </a>
          <a
            href="#workflow"
            className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors duration-200"
          >
            使用流程
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/login"
            className="text-muted-foreground hover:text-foreground hidden cursor-pointer rounded-full px-4 py-2 text-sm transition-colors duration-200 sm:inline-flex"
          >
            登录
          </Link>
          <Link
            href="/admin/login"
            className="bg-primary text-primary-foreground cursor-pointer rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 sm:px-5"
          >
            免费开始
          </Link>
        </div>
      </div>
    </header>
  );
}
