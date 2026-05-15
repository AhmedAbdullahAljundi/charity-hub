"use client";

import * as React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

type Row = Record<string, number | string | undefined>;

export function MiniSparkline({
  data,
  dataKey,
  colorVar = "--primary",
}: {
  data: Row[];
  dataKey: string;
  colorVar?: string;
}) {
  const uid = React.useId().replace(/:/g, "");
  const gradId = `spark-${uid}`;

  if (!data?.length) {
    return <div className="h-5 w-full rounded-sm bg-muted/25" aria-hidden />;
  }

  return (
    <div className="h-5 w-full min-w-0" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(${colorVar})`} stopOpacity={0.28} />
              <stop offset="100%" stopColor={`var(${colorVar})`} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={`var(${colorVar})`}
            fill={`url(#${gradId})`}
            strokeWidth={1.2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
