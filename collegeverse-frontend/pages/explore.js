/**
 * Explore Page - For Explorer users (personal email login)
 * Limited features: view colleges, compare, read public reviews
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../components/AuthContext";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  Building2,
  GraduationCap,
  Scale,
  Heart,
  Lock,
  ArrowRight,
  Filter,
  ChevronDown
} from "lucide-react";

// Sample college data (in production, fetch from API)
const sampleColleges = [
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    shortName: "IIT Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Government",
    overallRating: 4.7,
    ratingsCount: 1250,
    placementStats: { avgPackage: 21.5, highestPackage: 280 },
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400",
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    shortName: "BITS Pilani",
    city: "Pilani",
    state: "Rajasthan",
    type: "Private",
    overallRating: 4.5,
    ratingsCount: 890,
    placementStats: { avgPackage: 18.5, highestPackage: 150 },
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
  },
  {
    id: "vit-vellore",
    name: "VIT Vellore",
    shortName: "VIT Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    type: "Private",
    overallRating: 4.1,
    ratingsCount: 2100,
    placementStats: { avgPackage: 8.5, highestPackage: 44 },
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400",
  },
  {
    id: "nit-trichy",
    name: "NIT Tiruchirappalli",
    shortName: "NIT Trichy",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    type: "Government",
    overallRating: 4.4,
    ratingsCount: 780,
    placementStats: { avgPackage: 12.5, highestPackage: 65 },
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400",
  },
  {
    id: "srm-chennai",
    name: "SRM Institute of Science and Technology",
    shortName: "SRM Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Private",
    overallRating: 3.9,
    ratingsCount: 1800,
    placementStats: { avgPackage: 6.5, highestPackage: 42 },
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
  },
  {
    id: "manipal-udupi",
    name: "Manipal Institute of Technology",
    shortName: "MIT Manipal",
    city: "Manipal",
    state: "Karnataka",
    type: "Private",
    overallRating: 4.2,
    ratingsCount: 1400,
    placementStats: { avgPackage: 10.5, highestPackage: 58 },
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const { isAuthenticated, isExplorer, userData, can } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [compareList, setCompareList] = useState([]);
  const [savedColleges, setSavedColleges] = useState([]);
  
  // Filter colleges
  const filteredColleges = sampleColleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         college.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         college.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || college.type.toLowerCase() === selectedType;
    const matchesState = selectedState === "all" || college.state === selectedState;
    return matchesSearch && matchesType && matchesState;
  });
  
  const uniqueStates = [...new Set(sampleColleges.map(c => c.state))];
  
  const toggleCompare = (collegeId) => {
    if (compareList.includes(collegeId)) {
      setCompareList(compareList.filter(id => id !== collegeId));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, collegeId]);
    }
  };
  
  const toggleSave = (collegeId) => {
    if (savedColleges.includes(collegeId)) {
      setSavedColleges(savedColleges.filter(id => id !== collegeId));
    } else {
      setSavedColleges([...savedColleges, collegeId]);
    }
  };
  
  const goToCompare = () => {
    if (compareList.length >= 2) {
      router.push(`/colleges/compare?ids=${compareList.join(",")}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Explorer Mode Banner */}
      {isExplorer && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span className="font-medium">Explorer Mode</span>
              <span className="hidden sm:inline">- You're browsing with limited features</span>
            </div>
            <Link 
              href="/auth" 
              className="bg-white text-orange-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 flex items-center gap-1"
            >
              Upgrade with College Email <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Find Your Perfect College
          </h1>
          <p className="text-xl text-indigo-200 mb-8 text-center max-w-2xl mx-auto">
            Explore colleges, compare ratings, and make informed decisions based on real student reviews
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
              <Search className="h-6 w-6 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Search colleges by name, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-3 px-2 text-gray-800 focus:outline-none"
              />
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600 font-medium">Filters:</span>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
          </select>
          
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All States</option>
            {uniqueStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          {compareList.length > 0 && (
            <button
              onClick={goToCompare}
              disabled={compareList.length < 2}
              className={`ml-auto px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                compareList.length >= 2 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Scale className="h-5 w-5" />
              Compare ({compareList.length}/4)
            </button>
          )}
        </div>
        
        {/* Results Count */}
        <p className="text-gray-600 mb-4">
          Showing {filteredColleges.length} colleges
        </p>
        
        {/* College Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map(college => (
            <div 
              key={college.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative">
                <img 
                  src={college.image} 
                  alt={college.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => toggleSave(college.id)}
                    className={`p-2 rounded-full ${
                      savedColleges.includes(college.id) 
                        ? "bg-red-500 text-white" 
                        : "bg-white/80 text-gray-600 hover:bg-white"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${savedColleges.includes(college.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    college.type === "Government" 
                      ? "bg-green-500 text-white" 
                      : "bg-blue-500 text-white"
                  }`}>
                    {college.type}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {college.shortName}
                </h3>
                <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {college.city}, {college.state}
                </p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{college.overallRating}</span>
                    <span className="text-gray-400 text-sm">({college.ratingsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">₹{college.placementStats.avgPackage} LPA avg</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/college/${college.id}`}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-center font-medium hover:bg-indigo-700 transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => toggleCompare(college.id)}
                    className={`px-3 py-2 rounded-lg border-2 transition ${
                      compareList.includes(college.id)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                        : "border-gray-300 text-gray-600 hover:border-indigo-600"
                    }`}
                  >
                    <Scale className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredColleges.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No colleges found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      
      {/* Upgrade CTA (for explorers) */}
      {isExplorer && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <GraduationCap className="h-16 w-16 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Ask Questions & Connect with Seniors?
            </h2>
            <p className="text-indigo-200 mb-6 max-w-2xl mx-auto">
              Login with your college email to unlock full access: ask questions, get personalized answers from verified seniors, join college communities, and more!
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              Upgrade to Full Access <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
