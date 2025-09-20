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
    console.log(`Loaded ${reviews.length} reviews from localStorage`);
    console.log('Reviews data:', reviews);
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
    // Try Supabase first, fallback to localStorage
    console.log('Loading reviews from Supabase...');
    const supabaseReviews = await loadReviewsFromSupabase();
    if (supabaseReviews.length > 0) {
      console.log(`Loaded ${supabaseReviews.length} reviews from Supabase`);
      return supabaseReviews;
    }
    
    // Fallback to localStorage
    console.log('No Supabase reviews, loading from localStorage...');
    return loadReviewsFromLocalStorage();
  } catch (error) {
    console.error('Error loading college reviews:', error);
    // Fallback to localStorage
    return loadReviewsFromLocalStorage();
  }
};

export const getCollegesWithReviews = async (): Promise<{ college: College; reviews: CollegeReview[] }[]> => {
  try {
    const colleges = await loadColleges();
    const allReviews = await loadCollegeReviews();
    
    console.log(`Found ${colleges.length} colleges and ${allReviews.length} reviews`);
    
    const result = colleges.map(college => ({
      college,
      reviews: allReviews.filter(review => review.collegeCode === college.code)
    }));
    
    console.log(`Mapped ${result.length} colleges with reviews`);
    return result;
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
    
    // First, check if the college exists in the database
    let { data: collegeData, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('code', reviewData.collegeCode)
      .single();

    if (collegeError || !collegeData) {
      console.log('College not found, creating new college:', reviewData.collegeCode);
      // Create the college if it doesn't exist
      const { data: newCollege, error: createCollegeError } = await supabase
        .from('colleges')
        .insert({
          code: reviewData.collegeCode,
          name: `College ${reviewData.collegeCode}` // We'll get the real name from our JSON
        })
        .select()
        .single();

      if (createCollegeError || !newCollege) {
        console.error('Error creating college:', createCollegeError);
        // Fallback to localStorage
        return saveToLocalStorage(reviewData);
      }
      collegeData = newCollege;
    }

    // Create a temporary user for anonymous reviews
    const tempUserId = crypto.randomUUID();
    const tempUserEmail = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@temp.com`;
    
    console.log('Creating temporary user:', tempUserId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: tempUserId,
        email: tempUserEmail,
        full_name: 'Anonymous User'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating temporary user:', userError);
      // Fallback to localStorage
      return saveToLocalStorage(reviewData);
    }

    console.log('Inserting review...');
    const { data, error } = await supabase
      .from('college_reviews')
      .insert({
        college_id: collegeData.id,
        user_id: tempUserId,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        faculty_rating: reviewData.faculty_rating,
        infrastructure_rating: reviewData.infrastructure_rating,
        placements_rating: reviewData.placements_rating,
        helpful_votes: 0,
        verified: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving review to Supabase:', error);
      // Fallback to localStorage
      return saveToLocalStorage(reviewData);
    }

    console.log('Review saved successfully to Supabase:', data.id);
    return {
      id: data.id,
      college_id: data.college_id,
      user_id: data.user_id,
      rating: data.rating || 0,
      review_text: data.review_text || '',
      faculty_rating: data.faculty_rating || 0,
      infrastructure_rating: data.infrastructure_rating || 0,
      placements_rating: data.placements_rating || 0,
      helpful_votes: data.helpful_votes || 0,
      verified: data.verified || false,
      created_at: data.created_at || new Date().toISOString(),
      collegeCode: reviewData.collegeCode,
      author: `User ${data.user_id.slice(0, 8)}`
    };
  } catch (error) {
    console.error('Error saving review:', error);
    // Fallback to localStorage
    return saveToLocalStorage(reviewData);
  }
};

// Helper function to save to localStorage as fallback
const saveToLocalStorage = (reviewData: {
  collegeCode: string;
  rating: number;
  review_text: string;
  faculty_rating: number;
  infrastructure_rating: number;
  placements_rating: number;
  user_id?: string;
}): CollegeReview => {
  console.log('Saving to localStorage as fallback');
  
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
  console.log(`Before saving: ${existingReviews.length} reviews in localStorage`);
  
  existingReviews.push(mockReview);
  localStorage.setItem('local_reviews', JSON.stringify(existingReviews));
  
  // Verify it was saved
  const savedReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
  console.log(`After saving: ${savedReviews.length} reviews in localStorage`);
  console.log('Review saved to localStorage:', mockReview.id);
  console.log('Saved review data:', mockReview);
  
  return mockReview;
};
