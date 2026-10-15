
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import {
  QUESTION_BANK,
  type Question,
} from "../data/k53QuestionBank";

const EXAM_DURATION_SECONDS = 20 * 60;
const QUESTION_COUNT = 10;
const PASS_PERCENTAGE = 80;

function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function LearnerLicenceTest() {
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = examQuestions[currentIndex];

  const score = useMemo(
    () =>
      examQuestions.reduce(
        (total, question) =>
          total + (answers[question.id] === question.answer ? 1 : 0),
        0
      ),
    [examQuestions, answers]
  );

  const percentage =
    examQuestions.length > 0
      ? Math.round((score / examQuestions.length) * 100)
      : 0;

  function startExam() {
    const selected = shuffleQuestions(QUESTION_BANK).slice(
      0,
      Math.min(QUESTION_COUNT, QUESTION_BANK.length)
    );

    setExamQuestions(selected);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(EXAM_DURATION_SECONDS);
    setSubmitted(false);
    setStarted(true);
  }

  function submitExam() {
    setSubmitted(true);
    setStarted(false);
  }

  useEffect(() => {
    if (!started || submitted) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setSubmitted(true);
          setStarted(false);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, submitted]);

  if (!started && !submitted) {
    return (
      <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Card elevation={3}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Chip label="DrivePro-SA • Code B" color="primary" />

            <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
              Learner's Licence Practice Exam
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Prepare for your South African learner's licence examination
              with randomly selected questions from the practice question bank.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={2}>
              <Typography>
                <strong>Available question bank:</strong>{" "}
                {QUESTION_BANK.length} questions
              </Typography>
              <Typography>
                <strong>Questions per attempt:</strong>{" "}
                {Math.min(QUESTION_COUNT, QUESTION_BANK.length)}
              </Typography>
              <Typography>
                <strong>Time limit:</strong> 20 minutes
              </Typography>
              <Typography>
                <strong>Practice pass mark:</strong> {PASS_PERCENTAGE}%
              </Typography>
              <Typography>
                <strong>Sections:</strong> Rules of the Road, Road Traffic
                Signs and Vehicle Controls
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3, mb: 3 }}
            >
              This is an unofficial practice examination. The question bank,
              duration and pass mark are not a verified copy of the current
              government examination.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={startExam}
              disabled={QUESTION_BANK.length === 0}
            >
              Start Practice Exam
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Card elevation={3}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h4" fontWeight={700}>
              Examination Results
            </Typography>

            <Typography variant="h2" fontWeight={800} sx={{ my: 2 }}>
              {percentage}%
            </Typography>

            <Chip
              color={percentage >= PASS_PERCENTAGE ? "success" : "error"}
              label={
                percentage >= PASS_PERCENTAGE
                  ? "Practice pass"
                  : "Keep practising"
              }
            />

            <Typography sx={{ mt: 2 }}>
              You answered {score} out of {examQuestions.length} questions
              correctly.
            </Typography>

            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: 10, borderRadius: 5, my: 3 }}
            />

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" fontWeight={700}>
              Review your answers
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {examQuestions.map((question, index) => {
                const correct =
                  answers[question.id] === question.answer;

                return (
                  <Card
                    key={`${question.id}-${index}`}
                    variant="outlined"
                    sx={{
                      borderColor: correct ? "success.main" : "error.main",
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {correct ? (
                          <CheckCircleOutlineRoundedIcon color="success" />
                        ) : (
                          <CancelOutlinedIcon color="error" />
                        )}

                        <Typography fontWeight={700}>
                          Question {index + 1}
                        </Typography>
                      </Stack>

                      <Typography sx={{ mt: 1 }}>
                        {question.question}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Your answer:{" "}
                        {answers[question.id] === undefined
                          ? "Not answered"
                          : question.options[answers[question.id]]}
                      </Typography>

                      <Typography variant="body2" color="success.main">
                        Correct answer: {question.options[question.answer]}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {question.explanation}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ReplayRoundedIcon />}
              sx={{ mt: 3 }}
              onClick={startExam}
            >
              Try Another Exam
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Card elevation={3}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Learner's Licence Examination
              </Typography>

              <Typography color="text.secondary">
                Question {currentIndex + 1} of {examQuestions.length}
              </Typography>
            </Box>

            <Chip
              icon={<TimerOutlinedIcon />}
              color={timeLeft < 60 ? "error" : "primary"}
              label={formatTime(timeLeft)}
              sx={{ fontSize: "1rem", p: 1 }}
            />
          </Stack>

          <LinearProgress
            variant="determinate"
            value={((currentIndex + 1) / examQuestions.length) * 100}
            sx={{ my: 3, height: 8, borderRadius: 5 }}
          />

          <Chip
            label={currentQuestion.section}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            {currentQuestion.question}
          </Typography>

          <RadioGroup
            value={answers[currentQuestion.id] ?? ""}
            onChange={(event) =>
              setAnswers((previous) => ({
                ...previous,
                [currentQuestion.id]: Number(event.target.value),
              }))
            }
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel
                key={`${currentQuestion.id}-${index}`}
                value={index}
                control={<Radio />}
                label={option}
                sx={{
                  alignItems: "flex-start",
                  border: "1px solid",
                  borderColor:
                    answers[currentQuestion.id] === index
                      ? "primary.main"
                      : "divider",
                  borderRadius: 2,
                  p: 1,
                  mx: 0,
                  mb: 1,
                }}
              />
            ))}
          </RadioGroup>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
          >
            <Button
              variant="outlined"
              disabled={currentIndex === 0}
              onClick={() =>
                setCurrentIndex((previous) => previous - 1)
              }
            >
              Previous
            </Button>

            {currentIndex < examQuestions.length - 1 ? (
              <Button
                variant="contained"
                onClick={() =>
                  setCurrentIndex((previous) => previous + 1)
                }
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={submitExam}
              >
                Submit Examination
              </Button>
            )}
          </Stack>

          <Button
            color="inherit"
            sx={{ mt: 2 }}
            onClick={submitExam}
          >
            Finish Exam Now
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
