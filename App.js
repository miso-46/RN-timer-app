import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// 🔸 TimerDisplay: タイマー表示コンポーネント
function TimerDisplay({ timeLeft, isCompleted }) {
  // 分と秒に変換
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // 2桁表示にフォーマット
  const formatTime = (time) => time.toString().padStart(2, '0');
  
  // 残り時間に応じて色を変更（残り1分で赤色）
  const getTimerColor = () => {
    if (isCompleted) return '#FF3B30'; // 赤
    if (timeLeft <= 60) return '#FF9500'; // オレンジ
    return '#007AFF'; // 青
  };
  
  return (
    <View style={styles.timerDisplayContainer}>
      <Text style={[styles.timerText, { color: getTimerColor() }]}>
        🕐 {formatTime(minutes)}:{formatTime(seconds)}
      </Text>
    </View>
  );
}

// 🔸 TimeSelector: 時間設定コンポーネント
function TimeSelector({ minutes, seconds, onMinutesChange, onSecondsChange }) {
  return (
    <View style={styles.timeSelectorContainer}>
      <View style={styles.timeInputGroup}>
        <TextInput
          style={styles.timeInput}
          value={minutes.toString()}
          onChangeText={onMinutesChange}
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.timeLabel}>分</Text>
        
        <Text style={styles.timeSeparator}>:</Text>
        
        <TextInput
          style={styles.timeInput}
          value={seconds.toString()}
          onChangeText={onSecondsChange}
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.timeLabel}>秒</Text>
      </View>
    </View>
  );
}

// 🔸 ControlButtons: 操作ボタンコンポーネント
function ControlButtons({ isRunning, onStart, onStop, onReset }) {
  return (
    <View style={styles.controlButtonsContainer}>
      <View style={styles.startStopContainer}>
        {!isRunning ? (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={onStart}>
            <Text style={styles.buttonText}>▶️ スタート</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={onStop}>
            <Text style={styles.buttonText}>⏸️ ストップ</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
        <Text style={styles.buttonText}>🔄 リセット</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🔸 StatusMessage: 状態表示コンポーネント
function StatusMessage({ isRunning, isCompleted, timeLeft }) {
  let message = "タイマー停止中";
  let emoji = "⚡";
  let bgColor = "#F8F9FA";
  
  if (isCompleted) {
    message = "時間になりました！お疲れ様でした！";
    emoji = "🎉";
    bgColor = "#FFE6E6";
  } else if (isRunning) {
    if (timeLeft <= 60) {
      message = "もうすぐ終了です！";
      emoji = "⚠️";
      bgColor = "#FFF3E6";
    } else {
      message = "タイマー実行中";
      emoji = "🔥";
      bgColor = "#E6F7FF";
    }
  }
  
  return (
    <View style={[styles.statusContainer, { backgroundColor: bgColor }]}>
      <Text style={styles.statusText}>
        {emoji} {message}
      </Text>
    </View>
  );
}

// 🔸 QuickSetButtons: クイック設定ボタンコンポーネント
function QuickSetButtons({ onQuickSet, isRunning }) {
  const quickTimes = [
    { label: "1分", minutes: 1, seconds: 0 },
    { label: "5分", minutes: 5, seconds: 0 },
    { label: "10分", minutes: 10, seconds: 0 },
    { label: "25分", minutes: 25, seconds: 0 }, // ポモドーロテクニック
  ];

  if (isRunning) return null; // 実行中は表示しない

  return (
    <View style={styles.quickSetContainer}>
      <Text style={styles.quickSetTitle}>⚡ クイック設定</Text>
      <View style={styles.quickSetButtons}>
        {quickTimes.map((time, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickSetButton}
            onPress={() => onQuickSet(time.minutes, time.seconds)}
          >
            <Text style={styles.quickSetButtonText}>{time.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// 🔸 メインのAppコンポーネント
export default function App() {
  // 状態管理
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(330); // 5分30秒 = 330秒
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // タイマーのintervalを管理するためのref
  const intervalRef = useRef(null);

  // タイマーのメイン処理
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // 1秒ごとにtimeLeftを1減らす
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // タイマー完了
            setIsRunning(false);
            setIsCompleted(true);
            console.log("🎉 タイマー完了！");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // タイマーが停止している場合はintervalをクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // クリーンアップ：コンポーネントがアンマウントされた時にintervalをクリア
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // 時間設定の変更処理
  const handleMinutesChange = (text) => {
    const value = parseInt(text) || 0;
    if (value >= 0 && value <= 59) {
      setMinutes(value);
      // タイマーが停止中の場合、設定を即座に反映
      if (!isRunning) {
        setTimeLeft(value * 60 + seconds);
        setIsCompleted(false);
      }
    }
  };

  const handleSecondsChange = (text) => {
    const value = parseInt(text) || 0;
    if (value >= 0 && value <= 59) {
      setSeconds(value);
      // タイマーが停止中の場合、設定を即座に反映
      if (!isRunning) {
        setTimeLeft(minutes * 60 + value);
        setIsCompleted(false);
      }
    }
  };

  // ボタンの処理
  const handleStart = () => {
    if (timeLeft > 0) {
      console.log("⏰ タイマー開始");
      setIsRunning(true);
      setIsCompleted(false);
    }
  };

  const handleStop = () => {
    console.log("⏸️ タイマー一時停止");
    setIsRunning(false);
  };

  const handleReset = () => {
    console.log("🔄 タイマーリセット");
    setIsRunning(false);
    setIsCompleted(false);
    const newTimeLeft = minutes * 60 + seconds;
    setTimeLeft(newTimeLeft);
  };

  // クイック設定の処理
  const handleQuickSet = (newMinutes, newSeconds) => {
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    setTimeLeft(newMinutes * 60 + newSeconds);
    setIsCompleted(false);
    console.log(`⚡ クイック設定: ${newMinutes}分${newSeconds}秒`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏰ マイタイマー</Text>
      
      {/* タイマー表示 */}
      <TimerDisplay timeLeft={timeLeft} isCompleted={isCompleted} />
      
      {/* クイック設定ボタン */}
      <QuickSetButtons onQuickSet={handleQuickSet} isRunning={isRunning} />
      
      {/* 時間設定 */}
      {!isRunning && (
        <TimeSelector
          minutes={minutes}
          seconds={seconds}
          onMinutesChange={handleMinutesChange}
          onSecondsChange={handleSecondsChange}
        />
      )}
      
      {/* 操作ボタン */}
      <ControlButtons
        isRunning={isRunning}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
      />
      
      {/* 状態表示 */}
      <StatusMessage 
        isRunning={isRunning} 
        isCompleted={isCompleted}
        timeLeft={timeLeft}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  
  // タイマー表示スタイル
  timerDisplayContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 40,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  // 時間設定スタイル
  timeSelectorContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timeInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 60,
    backgroundColor: '#F8F9FA',
  },
  timeLabel: {
    fontSize: 18,
    marginLeft: 8,
    marginRight: 15,
    fontWeight: '500',
    color: '#333',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#007AFF',
  },
  
  // ボタンスタイル
  controlButtonsContainer: {
    marginBottom: 30,
  },
  startStopContainer: {
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  resetButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // 状態表示スタイル
  statusContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  // クイック設定スタイル
  quickSetContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickSetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  quickSetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickSetButton: {
    backgroundColor: '#F1F3F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  quickSetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});