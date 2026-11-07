import { Hono } from "hono";
import type { AppEnv } from "../types";
import { Layout } from "../components/layout";
import { DashboardView } from "../components/dashboard-view";
import { requireAuth } from "../middleware/auth";
import { getStatusCounts, listRecentVolunteers } from "../lib/volunteers";

export const dashboardRoutes = new Hono<AppEnv>();

dashboardRoutes.use("*", requireAuth);

dashboardRoutes.get("/", async (c) => {
  const [counts, recent] = await Promise.all([
    getStatusCounts(c.env.DB),
    listRecentVolunteers(c.env.DB, 5),
  ]);

  return c.html(
    <Layout
      title="편성 현황"
      user={c.get("user")}
      isAdmin={c.get("isAdmin")}
      active="dashboard"
    >
      <DashboardView counts={counts} recent={recent} />
    </Layout>,
  );
});
