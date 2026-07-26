export interface DialectConfig {
  id: string;
  title: string;
  nativeName?: string;
  subtitle: string;
  backgroundImage: string;
  datasetPath: string;
}

export const dialectsConfig: DialectConfig[] = [
  {
    id: "mandeali",
    title: "Mandeali",
    nativeName: "मंडयाली",
    subtitle: "Mandi region",
    backgroundImage: "/bg-mandeali.png",
    datasetPath: "/datasets/dummy.json",
  },
];

export const availableDialectsArray = dialectsConfig.map((d) => d.id);

export const datasetFilesMap: Record<string, string> = dialectsConfig.reduce(
  (acc, d) => {
    acc[d.id] = d.datasetPath;
    return acc;
  },
  {} as Record<string, string>
);

export const dialectToBackground: Record<string, string> =
  dialectsConfig.reduce(
    (acc, d) => {
      acc[d.id] = d.backgroundImage;
      return acc;
    },
    {} as Record<string, string>
  );
