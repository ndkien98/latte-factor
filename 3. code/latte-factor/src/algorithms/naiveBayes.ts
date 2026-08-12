// src/algorithms/naiveBayes.ts — Naive Bayes Classifier for Vietnamese text

import type { NaiveBayesResult, TransactionLabel } from '../types';
import { tokenizeVi } from '../nlp/tokenizeVi';

interface TrainingData {
  text: string;
  label: TransactionLabel;
}

interface ModelState {
  wordCounts: Record<string, Record<string, number>>;
  classCounts: Record<string, number>;
  vocabulary: Set<string>;
  totalDocs: number;
}

const CLASSES: TransactionLabel[] = ['essential', 'latte'];

function createEmptyModel(): ModelState {
  return {
    wordCounts: {
      essential: {},
      latte: {},
      unknown: {},
    },
    classCounts: { essential: 0, latte: 0, unknown: 0 },
    vocabulary: new Set(),
    totalDocs: 0,
  };
}

function trainFromData(data: TrainingData[]): ModelState {
  const model = createEmptyModel();

  data.forEach(({ text, label }) => {
    if (label === 'unknown') return;
    const tokens = tokenizeVi(text);
    const cls = label as string;

    model.classCounts[cls] = (model.classCounts[cls] ?? 0) + 1;
    model.totalDocs++;

    tokens.forEach(token => {
      model.vocabulary.add(token);
      model.wordCounts[cls] = model.wordCounts[cls] ?? {};
      model.wordCounts[cls][token] = (model.wordCounts[cls][token] ?? 0) + 1;
    });
  });

  return model;
}

export class NaiveBayesClassifier {
  private model: ModelState;

  constructor(initialData?: TrainingData[]) {
    this.model = createEmptyModel();
    if (initialData && initialData.length > 0) {
      this.model = trainFromData(initialData);
    }
  }

  train(data: TrainingData[]): void {
    const newModel = trainFromData(data);
    CLASSES.forEach(cls => {
      const clsStr = cls as string;
      this.model.classCounts[clsStr] = (this.model.classCounts[clsStr] ?? 0) + (newModel.classCounts[clsStr] ?? 0);
      Object.entries(newModel.wordCounts[clsStr] ?? {}).forEach(([word, count]) => {
        this.model.wordCounts[clsStr] = this.model.wordCounts[clsStr] ?? {};
        this.model.wordCounts[clsStr][word] = (this.model.wordCounts[clsStr][word] ?? 0) + count;
        this.model.vocabulary.add(word);
      });
    });
    newModel.vocabulary.forEach(w => this.model.vocabulary.add(w));
    this.model.totalDocs += newModel.totalDocs;
  }

  updateWithExample(text: string, label: TransactionLabel): void {
    if (label === 'unknown') return;
    const tokens = tokenizeVi(text);
    const cls = label as string;

    this.model.classCounts[cls] = (this.model.classCounts[cls] ?? 0) + 1;
    this.model.totalDocs++;

    tokens.forEach(token => {
      this.model.vocabulary.add(token);
      this.model.wordCounts[cls] = this.model.wordCounts[cls] ?? {};
      this.model.wordCounts[cls][token] = (this.model.wordCounts[cls][token] ?? 0) + 1;
    });
  }

  predict(text: string): NaiveBayesResult {
    if (this.model.totalDocs === 0) {
      return { label: 'unknown', confidence: 0, probabilities: {} };
    }

    const tokens = tokenizeVi(text);
    const vocabSize = this.model.vocabulary.size;
    const logProbs: Record<string, number> = {};

    CLASSES.forEach(cls => {
      const clsStr = cls as string;
      const clsCount = this.model.classCounts[clsStr] ?? 0;

      let logP = Math.log((clsCount + 1) / (this.model.totalDocs + CLASSES.length));
      const totalWordsInClass = Object.values(this.model.wordCounts[clsStr] ?? {}).reduce((s, c) => s + c, 0);
      tokens.forEach(token => {
        const wordCount = (this.model.wordCounts[clsStr]?.[token] ?? 0);
        logP += Math.log((wordCount + 1) / (totalWordsInClass + vocabSize + 1));
      });

      logProbs[clsStr] = logP;
    });

    const maxLogP = Math.max(...Object.values(logProbs));
    const exps: Record<string, number> = {};
    let sumExp = 0;
    Object.entries(logProbs).forEach(([cls, lp]) => {
      exps[cls] = Math.exp(lp - maxLogP);
      sumExp += exps[cls];
    });

    const probabilities: Record<string, number> = {};
    Object.entries(exps).forEach(([cls, e]) => {
      probabilities[cls] = e / sumExp;
    });

    const predictedLabel = Object.entries(probabilities)
      .sort((a, b) => b[1] - a[1])[0][0] as TransactionLabel;

    return {
      label: predictedLabel,
      confidence: probabilities[predictedLabel] ?? 0,
      probabilities,
    };
  }

  exportModel(): ModelState {
    return { ...this.model };
  }

  importModel(state: ModelState): void {
    this.model = {
      ...state,
      vocabulary: new Set(Array.from(state.vocabulary)),
    };
  }
}
