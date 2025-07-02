import {
  AcademicCapIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  CakeIcon,
  CloudIcon,
  HeartIcon,
  HomeIcon,
  PaintBrushIcon,
  SwatchIcon,
  TruckIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  FaceSmileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// DEPRECATED: Legacy topic mappings - use Topic interface instead
export const TOPIC_MAPPINGS: Record<string, string> = {
  'animals': 'Động vật',
  'body_parts': 'Bộ phận cơ thể',
  'business': 'Kinh doanh',
  'clothing': 'Quần áo',
  'colors': 'Màu sắc',
  'education': 'Giáo dục',
  'food': 'Thức ăn',
  'fruits': 'Trái cây',
  'health_medical': 'Y tế - Sức khỏe',
  'house_furniture': 'Nhà cửa - Nội thất',
  'sports': 'Thể thao',
  'technology': 'Công nghệ',
  'transportation': 'Giao thông',
  'travel': 'Du lịch',
  'weather': 'Thời tiết'
};

// Default topic icons mapping - use with Topic.name
export const TOPIC_ICONS: Record<string, any> = {
  'animals': FaceSmileIcon,
  'body_parts': HeartIcon,
  'business': BuildingOfficeIcon,
  'clothing': SwatchIcon,
  'colors': PaintBrushIcon,
  'education': AcademicCapIcon,
  'food': CakeIcon,
  'fruits': BeakerIcon,
  'health_medical': HeartIcon,
  'house_furniture': HomeIcon,
  'sports': FaceSmileIcon,
  'technology': ComputerDesktopIcon,
  'transportation': TruckIcon,
  'travel': GlobeAltIcon,
  'weather': CloudIcon
};

// Format topic display name
export function formatTopicDisplay(topic: string): string {
  return topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get Vietnamese topic name
export function getVietnameseTopicName(topic: string): string {
  return TOPIC_MAPPINGS[topic] || formatTopicDisplay(topic);
}

// Helper function to get topic icon by name
export const getTopicIcon = (topicName: string) => {
  return TOPIC_ICONS[topicName] || FaceSmileIcon;
};

// Helper function to get Vietnamese name (legacy support)
export const getTopicVietnameseName = (topicName: string) => {
  return TOPIC_MAPPINGS[topicName] || topicName;
};

// Get topic color class

// Get topic display with both Vietnamese and English
export function getTopicDisplayBilingual(topic: string, topicVi?: string): string {
  // Use topicVi from database if available, otherwise fallback to mapping
  const vietnameseName = topicVi || getVietnameseTopicName(topic);
  const englishName = formatTopicDisplay(topic);
  return `${vietnameseName} - ${englishName}`;
}

// Topic emoji mapping - centralized function to avoid duplication
export const getTopicEmoji = (topic: string): string => {
  const emojiMap: { [key: string]: string } = {
    'actions': '⚡',
    'animals': '🐕',
    'arts_culture': '🎨',
    'beverages': '🥤',
    'body_parts': '👁️',
    'business': '💼',
    'chemistry': '⚗️',
    'clothing': '👕',
    'clothing_fashion': '👗',
    'colors': '🎨',
    'cooking': '👨‍🍳',
    'economics': '📈',
    'education': '📚',
    'emotions': '😊',
    'entertainment': '🎭',
    'environment': '🌍',
    'family': '👨‍👩‍👧‍👦',
    'finance': '💰',
    'food': '🍕',
    'food_drink': '🍔',
    'fruits': '🍎',
    'health': '🏥',
    'history': '📜',
    'home': '🏠',
    'house_home': '🏡',
    'human_body': '🧠',
    'jobs_careers': '💼',
    'jobs_professions': '👨‍💼',
    'law': '⚖️',
    'marketing': '📊',
    'media_communication': '📱',
    'nature': '🌳',
    'people_relationships': '👥',
    'personality': '🧑‍🎓',
    'physics': '⚛️',
    'plants_flowers': '🌸',
    'politics': '🏛️',
    'psychology': '🧠',
    'school': '🏫',
    'school_supplies': '✏️',
    'science': '🔬',
    'shapes': '🔵',
    'shopping': '🛒',
    'sports': '⚽',
    'subjects': '📖',
    'technology': '💻',
    'time': '⏰',
    'transportation': '🚗',
    'travel': '✈️',
    'vegetables': '🥕',
    'weather': '🌤️'
  };
  return emojiMap[topic] || '📖';
};

// Simple display function for topics
export const getTopicDisplay = (topic: string, topicVi?: string): string => {
  if (topicVi) {
    return topicVi;
  }
  return topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ');
};
