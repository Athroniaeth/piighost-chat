import type { Entity, DetectionDTO } from "../services/api";
import type { Status } from "../pages/Home";
import ChatInput from "./chat/ChatInput";

interface PromptBoxScreenProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: (text?: string) => void;
  status: Status;
  pendingEntities: Entity[];
  pendingDetections: DetectionDTO[];
  availableLabels: string[];
  pendingMessage: string;
  onValidate: () => void;
  onCancelReview: () => void;
  onRemoveDetection: (det: DetectionDTO) => void;
  onAddDetection: (det: DetectionDTO) => void;
}

export default function PromptBoxScreen({
  inputValue,
  setInputValue,
  onSend,
  status,
  pendingEntities,
  pendingDetections,
  availableLabels,
  pendingMessage,
  onValidate,
  onCancelReview,
  onRemoveDetection,
  onAddDetection,
}: PromptBoxScreenProps) {
  return (
    <div className="bg-background-50 flex h-[calc(100%-1.5rem)] items-center justify-center p-4 lg:p-10 m-3 rounded-xl">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mx-auto mb-8 lg:mb-11 max-w-md text-center">
          <h1 className="from-primary-500 to-primary-300 mb-3 bg-linear-to-r bg-clip-text text-2xl lg:text-3xl leading-9 font-normal text-transparent">
            Hey, How Can I Assist?
          </h1>
          <p className="text-text-100 text-sm leading-5">
            Your personal data is detected and anonymized before reaching
            the LLM, so your privacy stays protected.
          </p>
        </div>

        <ChatInput
          variant="centered"
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={onSend}
          status={status}
          pendingEntities={pendingEntities}
          pendingDetections={pendingDetections}
          availableLabels={availableLabels}
          pendingMessage={pendingMessage}
          onValidate={onValidate}
          onCancelReview={onCancelReview}
          onRemoveDetection={onRemoveDetection}
          onAddDetection={onAddDetection}
        />
      </div>
    </div>
  );
}
