"use client";

import { useAgentStore } from "@/store/agent-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhoneOff, Mic, MicOff, Loader2, Volume2, User, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CallMessage = {
  role: "user" | "assistant";
  content: string;
};

export function TestCall() {
  const { agent, ui, toggleTestCall, voiceConfig, transcriberConfig } = useAgentStore();
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Browser Native refs
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<any>(null);

  // Audio Playback refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopRecording();
    };
  }, []);

  // Initialize first message
  useEffect(() => {
    if (ui.testCallOpen && messages.length === 0 && agent.firstMessage) {
      setMessages([{ role: "assistant", content: agent.firstMessage }]);
      playTTS(agent.firstMessage);
    }
  }, [ui.testCallOpen, messages.length, agent.firstMessage]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, status]);

  const toggleListening = async () => {
    if (status === "speaking") {
      stopAudio(); // interrupt the AI
    }
    
    if (status === "listening") {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setTranscript("");
      
      if (transcriberConfig.provider === "browser") {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          toast.error("Not Supported", { description: "Speech recognition is not supported in this browser. Please use Chrome." });
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = transcriberConfig.language || "en-US";

        let finalSpeech = "";

        recognition.onresult = (event: any) => {
          let interimText = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalSpeech += event.results[i][0].transcript;
            } else {
              interimText += event.results[i][0].transcript;
            }
          }
          setTranscript(finalSpeech || interimText);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event);
          if (event.error !== "aborted") {
            toast.error("Speech Recognition Error", { description: event.error });
          }
          setStatus("idle");
        };

        recognition.onend = async () => {
          if (status === "listening" || status === "thinking") {
            if (finalSpeech.trim()) {
              setStatus("thinking");
              await handleSendTranscript(finalSpeech);
            } else {
              setStatus("idle");
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setStatus("listening");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        try {
          await processAudio(audioBlob);
        } catch(err) {
          console.error(err);
        }
      };

      mediaRecorder.start();
      setStatus("listening");
    } catch (error) {
      console.error(error);
      toast.error("Microphone Error", { description: "Could not access microphone." });
    }
  };

  const stopRecording = () => {
    if (transcriberConfig.provider === "browser") {
      if (recognitionRef.current) {
        setStatus("thinking");
        recognitionRef.current.stop();
      }
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setStatus("thinking"); // Transition immediately so UI shows generating
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("provider", transcriberConfig.provider);

      const transcribeRes = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        const errData = await transcribeRes.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Failed to transcribe audio");
      }
      const { text } = await transcribeRes.json();
      
      setTranscript(text);
      await handleSendTranscript(text);
    } catch(err: any) {
      console.error(err);
      const errMsg = err.message || "Could not process audio with Soniox.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ [Transcription Error] ${errMsg}\n\nPlease check your Soniox account balance or configuration.` }
      ]);
      toast.error("Transcription Failed", { description: errMsg });
      setStatus("idle");
    }
  };

  const stopAudio = () => {
    if (voiceConfig.provider === "browser") {
      window.speechSynthesis.cancel();
      if (status === "speaking") setStatus("idle");
      return;
    }

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    if (status === "speaking") setStatus("idle");
  };

  const playTTS = async (text: string) => {
    try {
      setStatus("speaking");

      if (voiceConfig.provider === "browser") {
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        if (voiceConfig.voice === "Male") {
          const maleVoice = voices.find(v => 
            v.name.toLowerCase().includes("male") || 
            v.name.toLowerCase().includes("david") || 
            v.name.toLowerCase().includes("google us english")
          );
          if (maleVoice) utterance.voice = maleVoice;
        } else if (voiceConfig.voice === "Female") {
          const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes("female") || 
            v.name.toLowerCase().includes("zira") || 
            v.name.toLowerCase().includes("google uk english female")
          );
          if (femaleVoice) utterance.voice = femaleVoice;
        }

        utterance.onend = () => {
          setStatus("idle");
        };
        utterance.onerror = () => {
          setStatus("idle");
        };
        
        window.speechSynthesis.cancel(); // Stop any current speech
        window.speechSynthesis.speak(utterance);
        
        utteranceRef.current = utterance;
        return;
      }

      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          voice: voiceConfig.voice,
          stability: voiceConfig.stability,
        }),
      });

      if (!res.ok) throw new Error("Failed to synthesize speech");

      const arrayBuffer = await res.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setStatus("idle");
      };
      
      audioSourceRef.current = source;
      source.start(0);
    } catch (error) {
      console.error(error);
      toast.error("Audio Playback Error", { description: "Failed to play AI voice response." });
      setStatus("idle");
    }
  };

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) {
       setStatus("idle");
       return;
    }

    const newMessages: CallMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);

    try {
      // 1. Get text response from SLM
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: agent.provider,
          model: agent.model,
          systemPrompt: agent.systemPrompt,
          messages: newMessages,
        }),
      });

      if (!chatRes.ok) {
        const errData = await chatRes.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Failed to get chat response");
      }
      const chatData = await chatRes.json();
      const aiText = chatData.content;

      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);

      // 2. Play the audio TTS
      await playTTS(aiText);

    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || "The agent dropped the connection.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ [Call Error] ${errMsg}\n\nPlease check your AI Provider API key.` }
      ]);
      toast.error("Call Error", { description: errMsg });
      setStatus("idle");
    }
  };

  const handleClose = () => {
    stopAudio();
    stopRecording();
    setMessages([]); // reset on close
    toggleTestCall();
  };

  return (
    <Sheet open={ui.testCallOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 border-l border-border bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-4 border-b border-border bg-muted/30">
          <SheetTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              Live Call: {agent.name}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {status === "listening" && (
                <span className="flex items-center text-red-500 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> Recording
                </span>
              )}
              {status === "thinking" && (
                <span className="flex items-center text-amber-500">
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Thinking
                </span>
              )}
              {status === "speaking" && (
                <span className="flex items-center text-green-500">
                  <Volume2 className="w-3 h-3 animate-pulse mr-1.5" /> Speaking
                </span>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-primary/10 text-primary-foreground border border-primary/20 text-right"
                    : "bg-muted/50 text-foreground"
                )}
              >
                <div className="flex items-center gap-2 mb-1 opacity-70">
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 ml-auto" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span className={cn("text-[10px] uppercase font-bold tracking-wider", msg.role === "user" && "order-first")}>
                    {msg.role === "user" ? "You" : "Agent"}
                  </span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {msg.content}
                </div>
              </div>
            ))}

            {status === "thinking" && (
              <div className="flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted/50 text-foreground">
                <div className="flex items-center gap-1.5 py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">Generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="p-6 bg-background border-t border-border mt-auto flex flex-col items-center gap-4">
          
          <div className="flex items-center justify-center gap-6">
            <Button
              variant={status === "listening" ? "destructive" : "secondary"}
              size="lg"
              className={cn(
                "rounded-full w-16 h-16 transition-all duration-300",
                status === "listening" && "ring-4 ring-red-500/20"
              )}
              onClick={toggleListening}
              disabled={status === "thinking"}
            >
              {status === "listening" ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
              onClick={handleClose}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {status === "idle" && "Click the microphone to start recording."}
            {status === "listening" && "Recording... Click microphone to stop and send."}
            {status === "speaking" && "Agent is speaking. Click microphone to interrupt."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
