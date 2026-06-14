"use client";

import ProgressBarStatItem from "./progressBarStatItem";
import { LineChart } from "@/app/components/charts/tremor/LineChart";

interface CurrentStatsComponentProps {
  //todo change
  data: any;
}
const CurrentStatsComponent = ({ data }: CurrentStatsComponentProps) => {
  console.log({ data });
  const chartdata = [
    {
      date: "Jan 23",
      SolarPanels: 2890,
      Inverters: 2338,
    },
    {
      date: "Feb 23",
      SolarPanels: 2756,
      Inverters: 2103,
    },
    {
      date: "Mar 23",
      SolarPanels: 3322,
      Inverters: 2194,
    },
    {
      date: "Apr 23",
      SolarPanels: 3470,
      Inverters: 2108,
    },
    {
      date: "May 23",
      SolarPanels: 3475,
      Inverters: 1812,
    },
    {
      date: "Jun 23",
      SolarPanels: 3129,
      Inverters: 1726,
    },
    {
      date: "Jul 23",
      SolarPanels: 3490,
      Inverters: 1982,
    },
    {
      date: "Aug 23",
      SolarPanels: 2903,
      Inverters: 2012,
    },
    {
      date: "Sep 23",
      SolarPanels: 2643,
      Inverters: 2342,
    },
    {
      date: "Oct 23",
      SolarPanels: 2837,
      Inverters: 2473,
    },
    {
      date: "Nov 23",
      SolarPanels: 2954,
      Inverters: 3848,
    },
    {
      date: "Dec 23",
      SolarPanels: 3239,
      Inverters: 3736,
    },
  ];

  return (
    <div className="cardWithShadow">
      <div className="text-xl font-bold">Current Stats</div>
      <div>TOTAL SCANS: {data?.length}</div>
      <div className="flex flex-col gap-4">
        <ProgressBarStatItem
          title="Fat Percentage"
          progressPercentage={31}
          progressString="31%"
        />
        <ProgressBarStatItem
          title="TBW"
          progressPercentage={52}
          progressString="52%"
        />
        <ProgressBarStatItem
          title="Degree of obesity"
          progressPercentage={71}
          progressString="71%"
        />
      </div>
      <LineChart
        className="h-80"
        data={chartdata}
        index="date"
        categories={["SolarPanels", "Inverters"]}
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat("us").format(number).toString()}`
        }
        onValueChange={(v: any) => console.log(v)}
      />
    </div>
  );
};

export default CurrentStatsComponent;
