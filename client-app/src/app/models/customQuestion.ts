import { QuestionOption } from "./questionOption";
import { QuestionType } from "./questionType";

export interface CustomQuestion{
    id: string,
    registrationEventId: string,
    questionText: string,
    questionType: QuestionType
    required: boolean
    index: number
    options?: QuestionOption[];
}