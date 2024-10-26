import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';


console.log(import.meta.env.VITE_API_KEY);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const ResumeDataCreator: React.FC = () => {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = async () => {
    setLoading(true);
    
    const prompt = `Write a essay`;

    try {
      const result = await model.generateContent(prompt);
      // Assuming result.response is the correct way to access the text
      setStory(result.response.text());
    } catch (error) {
      setError('Error generating content');
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateStory();
  }, []);

  return (
    <div>
      <h1>Data Generated</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {story && <p>{story}</p>}
    </div>
  );
};

export default ResumeDataCreator;
