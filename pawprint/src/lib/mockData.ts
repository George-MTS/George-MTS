import type { BreedScanResult } from '@/types';

export const MOCK_SCAN_RESULT: BreedScanResult = {
  primary_breed: 'Golden Retriever',
  secondary_breed: undefined,
  breed_percentage: undefined,
  coat_description: 'Dense double coat with a water-repellent outer layer. Medium to long length, straight or slightly wavy, typically golden to cream in colour. Requires brushing 2-3 times per week and more during shedding seasons.',
  estimated_age_range: '2–4 years',
  size_category: 'Large (25–34 kg)',
  typical_temperament: 'Golden Retrievers are famously gentle, patient, and eager to please. They are highly social dogs that thrive on human companionship and are known for their unwavering loyalty. They adapt brilliantly to family life and are typically excellent with children and other animals.',
  common_health_considerations: 'Golden Retrievers can be prone to hip and elbow dysplasia, so regular vet check-ups are important. They are also at higher risk for certain cancers compared to other breeds. Maintaining a healthy weight through diet and daily exercise significantly improves long-term health outcomes.',
  fun_fact: 'Golden Retrievers were originally bred in the Scottish Highlands in the 1800s by Lord Tweedmouth to retrieve waterfowl. Their mouths are so gentle they can carry a raw egg without cracking it — a trait still used in field trials today.',
};

export const IS_TEST_MODE =
  !process.env.ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key' ||
  process.env.ANTHROPIC_API_KEY === 'placeholder' ||
  process.env.ANTHROPIC_API_KEY.length < 30;
