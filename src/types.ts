export type IntendedStartLine = "left" | "right" | "straight";
export type Curve = "leftToRight" | "rightToLeft" | "none";
export type Height = "low" | "medium" | "high";

export type ActualStartLine =
  | "farLeft"
  | "left"
  | "right"
  | "farRight"
  | "straight";

export type StrikeLocation =
  | "low"
  | "lowToe"
  | "toe"
  | "highToe"
  | "high"
  | "highHeel"
  | "heel"
  | "lowHeel"
  | "center";

export type EndLocation =
  | "shortLeft"
  | "left"
  | "longLeft"
  | "long"
  | "longRight"
  | "right"
  | "shortRight"
  | "short"
  | "target";
