import { useEffect, useState } from 'react';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { loadSettings, saveSettings } from './quiz/settings';
import type { AnswerRecord, Settings } from './quiz/types';

type Screen =
  | { name: 'settings' }
  | { name: 'quiz'; session: number }
  | { name: 'results'; records: AnswerRecord[] };

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [screen, setScreen] = useState<Screen>({ name: 'settings' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.name]);

  function updateSettings(next: Settings) {
    setSettings(next);
    saveSettings(next);
  }

  function startQuiz() {
    // A new session number remounts the quiz, so "Play again" starts fresh.
    setScreen({ name: 'quiz', session: Date.now() });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">
          DEADBEEF<span className="logo-sharp">♯</span>
        </h1>
        <p className="tagline">Music theory trainer</p>
      </header>

      <main>
        {screen.name === 'settings' && (
          <SettingsScreen settings={settings} onChange={updateSettings} onStart={startQuiz} />
        )}
        {screen.name === 'quiz' && (
          <QuizScreen
            key={screen.session}
            settings={settings}
            onFinish={(records) => setScreen({ name: 'results', records })}
          />
        )}
        {screen.name === 'results' && (
          <ResultsScreen
            records={screen.records}
            onPlayAgain={startQuiz}
            onChangeSettings={() => setScreen({ name: 'settings' })}
          />
        )}
      </main>
    </div>
  );
}
