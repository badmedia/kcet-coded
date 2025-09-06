# KCET Compass - Comprehensive KCET Admission Guide

A comprehensive web application for Karnataka CET (KCET) aspirants to explore college cutoffs, find suitable colleges, predict ranks, and make informed admission decisions.

## 🚀 Current Features

### ✅ **Fully Implemented Features**

#### 1. **Dashboard** 
- Real-time statistics from KCET data
- Data overview with total records, colleges, and branches
- Year-wise and category-wise distributions
- Top colleges and branches analysis
- Quick access to all features
- News integration for latest KCET updates

#### 2. **Rank Predictor** 
- **Fully functional** KCET rank prediction from marks
- Input KCET marks and PUC percentage
- Advanced prediction algorithm with historical data
- Category-wise predictions (GM, SC, ST, 1G, 2A, 2B, 3A, 3B)
- College suggestions based on predicted rank
- Save and manage prediction results
- Detailed analysis with percentile calculations
- Export results functionality

#### 3. **College Finder**
- **Advanced search** based on KCET rank
- Multiple filters: category, location, course preferences
- Safety level indicators (Safe/Moderate/Risky)
- Match score calculation
- Rank range slider for targeted search
- Real-time filtering and sorting
- Comprehensive college information display

#### 4. **Cutoff Explorer**
- **Complete cutoff data browser** with 63,000+ records
- Filter by year, category, college, branch, round
- Real-time search functionality
- Comprehensive data table with sorting
- Advanced filtering options
- Data export capabilities

#### 5. **Round Tracker**
- **Fully functional** counseling round tracking
- Real-time round status updates
- Progress tracking for each round
- Important alerts and notifications
- Timeline visualization
- Round-specific information and deadlines

#### 6. **Documents**
- **Complete document checklist** for KCET counseling
- Essential academic documents list
- KCET/NEET related documents
- Category-specific requirements
- Document copy requirements
- Verification process guidelines

### 🚧 **Under Development Features**

#### 1. **Mock Simulator** (Coming Soon)
- Simulate seat allotment process
- Test different preference orders
- Round-wise simulation using historical data

#### 2. **Seat Matrix** (Coming Soon)
- Detailed seat availability information
- Allocation trends and real-time updates
- College and course-wise seat distribution

#### 3. **College Compare** (Coming Soon)
- Side-by-side college comparison
- Cutoff trends, fees, and ratings
- Detailed comparison metrics

#### 4. **Fee Calculator** (Coming Soon)
- Estimate annual costs across colleges
- Category-wise fee calculations
- Total cost of education estimation

#### 5. **Analytics** (Coming Soon)
- Visual insights across years and branches
- Trend analysis and data visualization
- Comprehensive reporting features

#### 6. **Planner** (Coming Soon)
- Strategic option entry planning
- Rank analysis and college selection
- Mock allotment simulation

## 📊 **Data Coverage**

- **109,920+ records** extracted from KCET PDFs (2023-2025)
- **Multiple years**: 2023, 2024, 2025 data with round-wise cutoffs
- **Comprehensive colleges**: 180+ engineering colleges across Karnataka
- **All categories**: GM, SC, ST, 1G, 2A, 2B, 3A, 3B
- **All seat types**: Government, Management, COMEDK
- **100+ branches**: From Computer Science to specialized engineering streams

## 🛠️ **Technical Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Data Management**: Local JSON + Supabase integration
- **PDF Processing**: pdf-parse + custom extraction logic
- **Routing**: React Router v6
- **State Management**: React Query + React Hooks
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📦 **Installation & Setup**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/badmedia/kcet-coded.git
cd kcet-compass

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Data Management
npm run extract:cutoffs  # Extract data from PDFs
npm run move:xlsx        # Move Excel files to public
npm run fetch:news       # Fetch latest KCET news

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
```
## 🎯 **Key Features in Detail**

### Rank Predictor
- **Input**: KCET marks (0-180) and PUC percentage (0-100)
- **Output**: Predicted rank, percentile, and college suggestions
- **Algorithm**: Based on historical KCET data analysis
- **Categories**: Supports all KCET categories
- **Export**: Save results as PDF or Excel

### College Finder
- **Search**: By rank, category, location, course
- **Filters**: Multiple advanced filtering options
- **Safety Levels**: Safe, Moderate, Risky based on rank vs cutoff
- **Match Score**: Calculated compatibility score
- **Sorting**: By cutoff rank, college name, match score

### Cutoff Explorer
- **Data**: 63,000+ records from 2023-2025
- **Filters**: Year, category, college, course, round
- **Search**: Real-time search across all fields
- **Export**: Download filtered data as Excel/CSV

### Round Tracker
- **Real-time Updates**: Current round status and progress
- **Alerts**: Important notifications and deadlines
- **Timeline**: Visual representation of counseling rounds
- **Information**: Detailed round-specific information

## 📊 **Data Statistics**

### Current Data Coverage
- **Total Records**:109.920+
- **Years**: 2023, 2024, 2025
- **Colleges**: 180+
- **Branches**: 100+
- **Categories**: 8 (GM, SC, ST, 1G, 2A, 2B, 3A, 3B)

### Top Branches
1. CS - Computer Science (9,899 records)
2. CE - Civil Engineering (9,388 records)
3. EC - Electronics & Communication (8,839 records)

## 🚀 **Performance Features**

- **Lazy Loading**: Components load on demand
- **Data Pagination**: Large datasets are efficiently paginated
- **Search Optimization**: Fast filtering algorithms
- **Caching**: Local data caching for faster access
- **Responsive Design**: Optimized for all device sizes
- **Error Handling**: Comprehensive error boundaries

## 🔮 **Upcoming Features**

- [ ] **Mock Simulator**: Interactive counseling simulation
- [ ] **Seat Matrix**: Detailed seat availability
- [ ] **College Compare**: Side-by-side comparison
- [ ] **Fee Calculator**: Cost estimation tools
- [ ] **Analytics**: Advanced data visualization
- [ ] **Planner**: Strategic option entry planning
- [ ] **Mobile App**: React Native version
- [ ] **Real-time Updates**: Live data synchronization

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Karnataka Examination Authority (KEA)** for providing cutoff data
- **shadcn/ui** for the excellent component library
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the fast build tool

## 📞 **Support**

For support, questions, or feature requests:
- Create an issue on [GitHub](https://github.com/badmedia/kcet-coded/issues)
- Email: [your-email@domain.com]

---

**Made with ❤️ for KCET aspirants**

*Helping students make informed decisions for their engineering future*
