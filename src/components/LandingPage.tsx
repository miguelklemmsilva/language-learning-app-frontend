import { useNavigate } from "react-router-dom";
import { Mic, Headphones, Languages, LucideIcon, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const navigate = useNavigate();

  const notAuth = () => (
    <div className="flex flex-col items-center">
      <Button
        className="w-full max-w-[700px] text-xl font-semibold py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
        onClick={() => navigate("/home")}
      >
        Get Started
      </Button>
    </div>
  );

  interface FeatureCardProps {
    title: string;
    icon: LucideIcon;
    description: string;
  }

  const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    icon: Icon,
    description,
  }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <h3 className="text-xl font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Icon size={50} />
        <p>{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col items-center bg-gray-100">
      <div className="max-w-7xl w-full px-4 py-8 space-y-8">
        <Card className="w-full">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-5xl font-bold">PolyBara</h1>
            <p className="text-lg">
              Experience personalized language learning with PolyBara. Our
              AI-powered tools assist with translation, listening, and speaking
              exercises. Create custom vocabulary lists tailored to your
              learning objectives and progress at your own pace.
            </p>
            {notAuth()}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-semibold">
              Supported Languages and Regions:
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                "Spanish/es",
                "Spanish/mx",
                "Spanish/ar",
                "Portuguese/br",
                "Portuguese/pt",
                "Italian/it",
                "French/fr",
                "German/de",
                "Japanese/jp",
              ].map((flag) => (
                <img
                  key={flag}
                  src={`/Flags/${flag}.png`}
                  alt=""
                  className="w-24 h-16 object-cover rounded shadow-md"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-8 space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Advanced AI-Powered Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard
                title="AI-Assisted Conversations"
                icon={Bot}
                description="Engage with GPT-4 powered AI to practice writing and comprehension in your target language. Enhance your skills through interactive dialogue."
              />
              <FeatureCard
                title="Translation and Grammar Assistance"
                icon={Languages}
                description="Improve your language accuracy with our AI proofreader. Receive guidance on grammar and phrasing to refine your language skills."
              />
              <FeatureCard
                title="AI Speech Synthesis"
                icon={Headphones}
                description="Listen to AI-generated speech that mimics native pronunciation and intonation. Some languages offer multiple regional accents for comprehensive learning."
              />
              <FeatureCard
                title="Pronunciation Feedback"
                icon={Mic}
                description="Utilize Azure AI for real-time pronunciation assessment. Receive constructive feedback to improve your accent and speaking confidence."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Ready to enhance your language skills?
            </h2>
            <Button
              className="w-full max-w-[700px] text-xl font-semibold py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
              onClick={() => navigate("/home")}
            >
              Begin Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
