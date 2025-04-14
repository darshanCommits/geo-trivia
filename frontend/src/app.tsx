import type { QuestionType } from "@shared/types";
import { useEffect, useReducer } from "react";
import { useQuery } from "@tanstack/react-query";
import Question from "./Question";
import GameOver from "./components/gameOver";
import Header from "./components/header";
import Loading from "./components/loading";
import ProgressBar from "./components/progressBar";

// Fetch a single question from the /next endpoint.
// Returns a question object or null if there are no more questions.
const fetchNextQuestion = async (): Promise<QuestionType> => {
  const response = await fetch("http://localhost:3000/next");
  if (!response.ok) {
    throw new Error("Failed to fetch next question");
  }
  return response.json();
};

// Game state type
type GameState = {
  questionCount: number;
  score: number;
  gameOver: boolean;
};

// Game action type
type GameAction =
  | { type: "ANSWER_QUESTION"; payload: boolean }
  | { type: "GAME_OVER" }
  | { type: "RESET_GAME" };

// Initial game state
const initialGameState: GameState = {
  questionCount: 0,
  score: 0,
  gameOver: false,
};

// Game reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ANSWER_QUESTION":
      return {
        ...state,
        questionCount: state.questionCount + 1,
        score: action.payload ? state.score + 1 : state.score,
      };
    case "GAME_OVER":
      return { ...state, gameOver: true };
    case "RESET_GAME":
      return initialGameState;
    default:
      return state;
  }
}

/**
 * Main Trivia Game application component
 */
function App() {
  // Use React Query to fetch a single question from /next.
  // The query is disabled initially so that we can control when to fetch.
  const {
    data: currentQuestion,
    isLoading,
    error,
    refetch,
  } = useQuery<QuestionType, Error>({
    queryKey: ["question"],
    queryFn: fetchNextQuestion,
    enabled: false,
  });

  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { questionCount, score, gameOver } = state;

  // On mount, fetch the first question.
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAnswer = async (isCorrect: boolean): Promise<void> => {
    // If there's no current question, end the game.
    if (!currentQuestion) {
      dispatch({ type: "GAME_OVER" });
      return;
    }

    dispatch({ type: "ANSWER_QUESTION", payload: isCorrect });

    const result = await refetch();
    // If no question is returned, end the game.
    if (!result.data) {
      dispatch({ type: "GAME_OVER" });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading question: {error.message}
      </div>
    );
  }

  // Render Game Over screen if game is over.
  if (gameOver) {
    return (
      <GameOver
        score={score}
        totalQuestions={questionCount}
        resetGame={() => {
          dispatch({ type: "RESET_GAME" });
          refetch(); // Optionally refetch the first question after reset.
        }}
      />
    );
  }

  // If for any reason there's no current question, show a fallback.
  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  // Calculate progress. Here we simply show the current question number.
  const progress = questionCount ? (questionCount / (questionCount + 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 py-10 px-4 text-white">
      <Header />
      <ProgressBar
        progress={progress}
        totalQuestions={questionCount + 1} // Shows the current question number as total.
        currentQuestion={questionCount + 1}
      />
      <div className="flex flex-col items-center space-y-8">
        <Question
          question={currentQuestion.question}
          options={currentQuestion.options}
          correctAnswer={currentQuestion.options[currentQuestion.correctAnswer]}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}

export default App;
