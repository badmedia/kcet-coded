import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = "https://mwrsinofpjmlxniiecdu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cnNpbm9mcGptbHhuaWllY2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDM1NzYsImV4cCI6MjA3MTg3OTU3Nn0.6LhWEpz-h9m44UtoXgO1aMPQbPJKo-A-TorjMGOE2Qw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugReviewLoading() {
  try {
    console.log('🔍 Debugging review loading process...\n');
    
    // Step 1: Check reviews in database
    console.log('📖 Step 1: Checking reviews in database...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('college_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.log('❌ Error loading reviews:', reviewsError.message);
      return;
    }

    console.log(`Found ${reviews?.length || 0} reviews in database`);
    
    if (reviews && reviews.length > 0) {
      const review = reviews[0];
      console.log('Sample review:', {
        id: review.id,
        college_id: review.college_id,
        user_id: review.user_id,
        session_id: review.session_id,
        rating: review.rating,
        text: review.review_text?.substring(0, 50) + '...'
      });
      
      // Step 2: Check if college exists
      console.log('\n🏫 Step 2: Checking college data...');
      const { data: college, error: collegeError } = await supabase
        .from('colleges')
        .select('id, code, name')
        .eq('id', review.college_id)
        .single();
      
      if (collegeError) {
        console.log('❌ College not found:', collegeError.message);
        console.log('   This is why reviews are not showing up!');
        
        // Step 3: Check all colleges
        console.log('\n📋 Step 3: Checking all colleges...');
        const { data: allColleges, error: allCollegesError } = await supabase
          .from('colleges')
          .select('id, code, name')
          .limit(5);
        
        if (allCollegesError) {
          console.log('❌ Error loading colleges:', allCollegesError.message);
        } else {
          console.log(`Found ${allColleges?.length || 0} colleges:`);
          allColleges?.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col.code} - ${col.name} (ID: ${col.id})`);
          });
        }
        
        // Step 4: Fix the review by updating college_id
        if (allColleges && allColleges.length > 0) {
          console.log('\n🔧 Step 4: Fixing review college_id...');
          const firstCollege = allColleges[0];
          console.log(`Updating review to use college: ${firstCollege.code} - ${firstCollege.name}`);
          
          const { error: updateError } = await supabase
            .from('college_reviews')
            .update({ college_id: firstCollege.id })
            .eq('id', review.id);
          
          if (updateError) {
            console.log('❌ Error updating review:', updateError.message);
          } else {
            console.log('✅ Review updated successfully!');
            console.log('   The review should now be visible on the website');
          }
        }
        
      } else {
        console.log('✅ College found:', {
          id: college.id,
          code: college.code,
          name: college.name
        });
        console.log('   The review should be visible. Check the frontend code for other issues.');
      }
    } else {
      console.log('No reviews found in database');
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

debugReviewLoading();
