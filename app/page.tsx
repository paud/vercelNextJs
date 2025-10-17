export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import Link from "next/link";

const SORT_OPTIONS = [
  { label: "新しい", value: "createdAt" },
  { label: "テーマ", value: "title" },
  { label: "作者", value: "author" },
];

function getOrderBy(sort: string) {
  if (sort === "title") return { title: "asc" };
  if (sort === "author") return { author: { name: "asc" } };
  return { createdAt: "desc" };
}

// 更通用的 searchParams 类型
interface HomePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}
export default async function Home({ searchParams }: HomePageProps) {
  // 如果只需要 sort，可以这样安全取值
  const sort = Array.isArray(searchParams?.sort)
    ? searchParams.sort[0]
    : searchParams?.sort || "createdAt";

  const orderBy = getOrderBy(sort);

  const posts = await prisma.post.findMany({
    orderBy,
    take: 6,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  /*
export default async function Home({
  searchParams,
}: {
  searchParams?: { sort?: string };
}) {
  const sort = searchParams?.sort || "createdAt";
  const orderBy = getOrderBy(sort);

  const posts = await prisma.post.findMany({
    orderBy,
    take: 6,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
*/
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-2 w-full max-w-6xl flex flex-wrap items-center justify-between">
        <h1 className="text-xl font-bold text-[#333333] whitespace-nowrap mr-4">
          分类导航
        </h1>
        <div className="flex flex-wrap gap-3">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/?sort=${option.value}`}
              className={`px-4 py-2 rounded-lg border text-base ${
                sort === option.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
              } transition`}
              scroll={false}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="group">
            <div className="border rounded-lg shadow-md bg-white p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-blue-600 group-hover:underline mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500">
                by {post.author ? post.author.name : "Anonymous"}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="relative">
                <p className="text-gray-700 leading-relaxed line-clamp-2">
                  {post.content || "No content available."}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
