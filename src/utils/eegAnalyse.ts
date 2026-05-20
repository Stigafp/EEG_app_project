export type EEGSpike = {
  index: number;
  value: number;
};

export type EEGTrendResultat = {
    spikeCount: number;
    averageAmplitude: number;
    maxAmplitude: number;
    status: "LOW" | "MEDIUM" | "HIGH";
    spikes: EEGSpike[];
    score: number;
};

export  function analyseEEGTrend(samples: number[]): EEGTrendResultat {
  if(samples.length < 5) {
    return {
        spikeCount: 0,
        averageAmplitude: 0,
        maxAmplitude: 0,
        status: "LOW",
        spikes: [],
        score: 0,
    };
  }

  const min = Math.min(...samples);
  const normalised = samples.map(value => value - min);

  const averageAmplitude = normalised.reduce((sum, value) => sum + value, 0) / normalised.length;
  const maxAmplitude = Math.max(...normalised);

  const spikeThreshold = averageAmplitude * 2.5;

  const spikes: EEGSpike[] = [];

  normalised.forEach((value, index) => {
    if(value > spikeThreshold){
      spikes.push({index, value});
    }
  });

  const spikeScore = Math.min(spikes.length * 3, 60);
  const amplitudeScore = Math.min(averageAmplitude / 2, 50);
  const score = Math.round(spikeScore + amplitudeScore);

  let status: EEGTrendResultat["status"] = "LOW";

  if(score >= 35){
    status = "HIGH";
  } else if (score >= 20){
    status = "MEDIUM";
  }

  return {
    spikeCount: spikes.length,
    averageAmplitude,
    maxAmplitude,
    status,
    spikes,
    score,
  };
}