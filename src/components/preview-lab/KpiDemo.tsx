import React, { useState } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { I18nextProvider } from "react-i18next";
import {
  CommentSection,
  SpaceKpisPage,
  ToasterBar,
  createKpiDemoFixtures,
  defaultFormattedTimePreferences,
  i18n,
  showErrorToast,
  useKpiDemo,
} from "@operately/turboui";
import type { KpiDemo as KpiDemoState } from "@operately/turboui";

export function KpiDemo() {
  const [fixtures] = useState(() => createKpiDemoFixtures({ kpisLink: "/kpis" }));
  // Keep the owner above the router and comment panels so navigation preserves edits.
  const demo = useKpiDemo(fixtures);
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[fixtures.kpis[0]?.link ?? fixtures.kpisLink]}>
        <DemoPage demo={demo} />
      </MemoryRouter>
    </I18nextProvider>
  );
}

function DemoPage({ demo }: { demo: KpiDemoState }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const selected = demo.kpis.find((kpi) => kpi.link === pathname) ?? null;
  const subscriptions = selected ? demo.getSubscriptionProps(selected.id) : undefined;

  return (
    <>
      <SpaceKpisPage
        {...demo.actions}
        onDeleteKpi={async (id) => {
          const result = await demo.actions.onDeleteKpi(id);
          if (result.success) navigate(demo.kpisLink);
          return result;
        }}
        space={demo.space}
        navigation={[{ to: demo.kpisLink, label: demo.space.name }]}
        kpisLink={demo.kpisLink}
        kpis={demo.kpis}
        selectedKpi={selected}
        currentUser={demo.currentUser}
        championSearch={demo.championSearch}
        richTextHandlers={demo.richTextHandlers}
        canComment
        subscriptions={
          subscriptions && {
            ...subscriptions,
            onToggle: (subscribed) => {
              void subscriptions
                .onToggle(subscribed)
                .catch((error) => showErrorToast("Could not update demo subscription.", error.message));
            },
          }
        }
        renderEntryComments={(entry) => (
          <CommentSection
            {...demo.getCommentProps(entry.id)}
            canComment
            canManageComments
            formattedTimePreferences={defaultFormattedTimePreferences}
          />
        )}
      />
      <ToasterBar />
    </>
  );
}
