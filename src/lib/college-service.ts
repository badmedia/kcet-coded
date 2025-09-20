export interface College {
  code: string;
  name: string;
}

export interface CollegeReview {
  id: string;
  college_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  faculty_rating: number;
  infrastructure_rating: number;
  placements_rating: number;
  helpful_votes: number;
  verified: boolean;
  created_at: string;
  // Additional fields for display
  collegeCode?: string;
  collegeName?: string;
  author?: string;
}

import { supabase } from "@/integrations/supabase/client";

// Load reviews from localStorage (temporary solution)
const loadReviewsFromLocalStorage = (): CollegeReview[] => {
  try {
    const reviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
    return reviews;
  } catch (error) {
    console.error('Error loading reviews from localStorage:', error);
    return [];
  }
};

// Load reviews from Supabase (when authentication is properly set up)
const loadReviewsFromSupabase = async (): Promise<CollegeReview[]> => {
  try {
    console.log('Loading reviews from Supabase...');
    const { data, error } = await supabase
      .from('college_reviews')
      .select(`
        *,
        colleges!college_reviews_college_id_fkey (
          code,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reviews from Supabase:', error);
      return [];
    }

    console.log(`Loaded ${data?.length || 0} reviews from Supabase`);
    return data?.map(review => ({
      id: review.id,
      college_id: review.college_id,
      user_id: review.user_id,
      rating: review.rating || 0,
      review_text: review.review_text || '',
      faculty_rating: review.faculty_rating || 0,
      infrastructure_rating: review.infrastructure_rating || 0,
      placements_rating: review.placements_rating || 0,
      helpful_votes: review.helpful_votes || 0,
      verified: review.verified || false,
      created_at: review.created_at || new Date().toISOString(),
      collegeCode: review.colleges?.code,
      collegeName: review.colleges?.name,
      author: `User ${review.user_id.slice(0, 8)}` // Temporary author display
    })) || [];
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
};

export const loadColleges = async (): Promise<College[]> => {
  try {
    const response = await fetch('/colleges-list.json');
    if (!response.ok) {
      throw new Error('Failed to load colleges data');
    }
    const colleges = await response.json();
    
    // Clean up college names
    return colleges.map((college: College) => ({
      ...college,
      name: college.name
        .replace(/^E:\s*/, '')   // Remove leading "E:" prefix
        .replace(/\s*:\s*$/, '') // Remove trailing ":" and spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .trim()
    }));
  } catch (error) {
    console.error('Error loading colleges:', error);
    return [];
  }
};

export const loadCollegeReviews = async (): Promise<CollegeReview[]> => {
  try {
    // Load from Supabase
    return await loadReviewsFromSupabase();
  } catch (error) {
    console.error('Error loading college reviews:', error);
    // Fallback to localStorage if Supabase fails
    return loadReviewsFromLocalStorage();
  }
};

export const getCollegesWithReviews = async (): Promise<{ college: College; reviews: CollegeReview[] }[]> => {
  try {
    const colleges = await loadColleges();
    const allReviews = await loadCollegeReviews();
    
    return colleges.map(college => ({
      college,
      reviews: allReviews.filter(review => review.collegeCode === college.code)
    }));
  } catch (error) {
    console.error('Error loading colleges with reviews:', error);
    return [];
  }
};

export const saveReviewToSupabase = async (reviewData: {
  collegeCode: string;
  rating: number;
  review_text: string;
  faculty_rating: number;
  infrastructure_rating: number;
  placements_rating: number;
  user_id?: string;
}): Promise<CollegeReview | null> => {
  try {
    console.log('Saving review to Supabase:', reviewData.collegeCode);
    
    // For now, let's use a simpler approach and store reviews locally
    // until we can properly set up the RLS policies
    console.log('Using localStorage fallback due to RLS restrictions');
    
    // Create a mock review object
    const mockReview: CollegeReview = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      college_id: `college_${reviewData.collegeCode}`,
      user_id: `user_${Date.now()}`,
      rating: reviewData.rating,
      review_text: reviewData.review_text,
      faculty_rating: reviewData.faculty_rating,
      infrastructure_rating: reviewData.infrastructure_rating,
      placements_rating: reviewData.placements_rating,
      helpful_votes: 0,
      verified: false,
      created_at: new Date().toISOString(),
      collegeCode: reviewData.collegeCode,
      author: `User ${Date.now().toString().slice(-8)}`
    };

    // Store in localStorage for persistence during session
    const existingReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
    existingReviews.push(mockReview);
    localStorage.setItem('local_reviews', JSON.stringify(existingReviews));

    console.log('Review saved to localStorage:', mockReview.id);
    return mockReview;
  } catch (error) {
    console.error('Error saving review:', error);
    return null;
  }
};
