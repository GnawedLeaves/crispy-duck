import { BodyScanDataPoint } from "./getBodyScanDataAction";

export interface AiAnalysisSummary {
  id: string;
  analysis_text: string;
  created_at: string;
}

export interface AiAnalysisRow extends AiAnalysisSummary {
  trend_data: BodyScanDataPoint[];
}
