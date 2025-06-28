'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardData {
  user: {
    dailyGoal: number;
    currentStreak: number;
    longestStreak: number;
    totalWordsLearned: number;
  };
  todayProgress: {
    wordsLearned: number;
    wordsReviewed: number;
    totalProgress: number;
  };
  wordsToReview: number;
  difficultWords: number;
  masteredWords: number;
  totalLearned: number;
  progressPercentage: number;
}

export default function LearningDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(10);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await vocabularyAPI.getDashboard();
      setDashboardData(response.data);
      setNewGoal(response.data.user.dailyGoal);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyGoal = async () => {
    try {
      await userAPI.setDailyGoal(newGoal);
      setShowGoalModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, todayProgress, wordsToReview, difficultWords, masteredWords, progressPercentage } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">Track your vocabulary learning progress</p>
      </div>

      {/* Daily Progress Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Progress</h2>
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Goal: {user.dailyGoal} words
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{todayProgress.totalProgress} / {user.dailyGoal} words</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{todayProgress.wordsLearned}</div>
            <div className="text-sm opacity-80">New Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayProgress.wordsReviewed}</div>
            <div className="text-sm opacity-80">Reviewed</div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ActionCard
          title="Learn New Words"
          description="Start learning new vocabulary"
          count={`${user.dailyGoal - todayProgress.wordsLearned} remaining`}
          color="bg-green-500"
          onClick={() => router.push('/learn/new')}
        />

        <ActionCard
          title="Review Words"
          description="Review words due today"
          count={`${wordsToReview} words`}
          color="bg-yellow-500"
          onClick={() => router.push('/learn/review')}
        />

        <ActionCard
          title="Take Test"
          description="Test your knowledge"
          count="Multiple choice"
          color="bg-purple-500"
          onClick={() => router.push('/learn/test')}
        />

        <ActionCard
          title="Difficult Words"
          description="Practice challenging words"
          count={`${difficultWords} words`}
          color="bg-red-500"
          onClick={() => router.push('/learn/difficult')}
        />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Current Streak"
          value={`${user.currentStreak} days`}
          subtitle={`Longest: ${user.longestStreak} days`}
          icon="🔥"
        />

        <StatCard
          title="Words Mastered"
          value={masteredWords.toString()}
          subtitle={`${Math.round((masteredWords / (masteredWords + wordsToReview + difficultWords)) * 100)}% of learned`}
          icon="⭐"
        />

        <StatCard
          title="Total Learned"
          value={user.totalWordsLearned.toString()}
          subtitle="All time"
          icon="📚"
        />
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Set Daily Goal</h3>
            <p className="text-gray-600 mb-4">How many words do you want to learn per day?</p>

            <div className="mb-6">
              <input
                type="range"
                min="5"
                max="50"
                value={newGoal}
                onChange={(e) => setNewGoal(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>5</span>
                <span className="font-semibold text-blue-600">{newGoal} words</span>
                <span>50</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateDailyGoal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ title, description, count, color, onClick }: {
  title: string;
  description: string;
  count: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`${color} text-white rounded-lg p-6 cursor-pointer hover:opacity-90 transition-opacity`}
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm opacity-90 mb-3">{description}</p>
      <div className="text-xl font-bold">{count}</div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
}
