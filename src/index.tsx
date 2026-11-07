import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./types";
import { adminRoutes } from "./routes/admin";
import { applicationsRoutes } from "./routes/applications";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { publicRoutes } from "./routes/public";
import { schedulesRoutes } from "./routes/schedules";
import { volunteersRoutes } from "./routes/volunteers";
import { NoticePage } from "./components/notice";

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  }),
);

app.route("/", publicRoutes);
app.route("/", authRoutes);
app.route("/admin", dashboardRoutes);
app.route("/admin/applications", applicationsRoutes);
app.route("/admin/schedules", schedulesRoutes);
app.route("/admin/volunteers", volunteersRoutes);
app.route("/admin/emails", adminRoutes);

// 이전 관리자 주소를 쓰던 북마크를 새 경로로 보냅니다.
app.get("/volunteers", (c) => c.redirect("/admin/volunteers", 301));

app.notFound((c) => {
  if (c.req.header("HX-Request") === "true") return c.body(null, 404);
  const brand = c.req.path.startsWith("/admin") || c.req.path.startsWith("/login")
    ? "admin"
    : "public";
  return c.html(
    <NoticePage
      code="404"
      title="페이지를 찾을 수 없습니다"
      description="주소가 바뀌었거나 삭제된 항목입니다. 안내 페이지에서 다시 시작하세요."
      brand={brand}
    />,
    404,
  );
});

app.onError((error, c) => {
  console.error(error);
  if (c.req.header("HX-Request") === "true") return c.body(null, 500);
  const brand = c.req.path.startsWith("/admin") || c.req.path.startsWith("/login")
    ? "admin"
    : "public";
  return c.html(
    <NoticePage
      code="500"
      title="요청을 처리하지 못했습니다"
      description="잠시 후 다시 시도하세요. 문제가 계속되면 운영 담당자에게 알려주세요."
      brand={brand}
    />,
    500,
  );
});

export default app;
