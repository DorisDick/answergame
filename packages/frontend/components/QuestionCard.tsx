"use client";

import { useState } from "react";
import { Question } from "@/hooks/useAnswerGame";

interface QuestionCardProps {
  question: Question;
  onSubmit: (questionId: number, answer: number) => Promise<{ ok: boolean; correctAnswer?: number } | void>;
  isLoading?: boolean;
  answered?: { ok: boolean } | undefined;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSubmit,
  isLoading = false,
  answered,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [serverCorrectAnswer, setServerCorrectAnswer] = useState<number | undefined>(undefined);

  const effectiveSubmitted = submitted || Boolean(answered);
  const effectiveWasCorrect = answered ? answered.ok : wasCorrect;

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    try {
      setIsSubmitting(true);
      const res = (await onSubmit(question.id, selectedAnswer)) as
        | { ok: boolean; correctAnswer?: number }
        | void;
      setSubmitted(true);
      if (res && typeof res === "object" && "ok" in res) {
        setWasCorrect(res.ok);
        if (typeof res.correctAnswer === "number") setServerCorrectAnswer(res.correctAnswer);
      }
    } catch (error) {
      console.error("提交答案失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-blue-100 text-blue-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-orange-100 text-orange-800";
      case 5: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "简单";
      case 2: return "容易";
      case 3: return "中等";
      case 4: return "困难";
      case 5: return "极难";
      default: return "未知";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          题目 #{question.id}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {getDifficultyText(question.difficulty)}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-gray-800 text-base leading-relaxed">
          {question.questionText}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedAnswer === index
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={index}
              checked={selectedAnswer === index}
              onChange={(e) => setSelectedAnswer(Number(e.target.value))}
              className="sr-only"
              disabled={effectiveSubmitted}
            />
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              selectedAnswer === index
                ? "border-primary-500 bg-primary-500"
                : "border-gray-300"
            }`}>
              {selectedAnswer === index && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          奖励: {Number(question.difficulty) * 10} ANS
        </div>
        <button
          onClick={handleSubmit}
          disabled={effectiveSubmitted || selectedAnswer === null || isSubmitting || isLoading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {effectiveSubmitted ? "已提交" : isSubmitting ? "提交中..." : "提交答案"}
        </button>
      </div>

      {effectiveSubmitted && (
        <div className={`mt-4 text-sm ${effectiveWasCorrect ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"} p-2 rounded`}>
          {effectiveWasCorrect ? (
            <>回答正确！</>
          ) : (
            <>回答错误。正确答案是：{question.options[serverCorrectAnswer ?? question.correctAnswer] ?? "未知"}</>
          )}
        </div>
      )}
    </div>
  );
};
