'use client'

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonPulse, staggerContainer, staggerItem } from "@/lib/animations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  type: 'pdf' | 'form' | 'dashboard';
}

export function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  
  /**
   * Enhanced PDF viewer loading skeleton with stagger animations
   */
  const renderPdfSkeleton = () => (
    <motion.div 
      className="h-full p-4 space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* PDF page navigation skeleton */}
      <motion.div 
        className="flex items-center justify-between p-3 border-b"
        variants={staggerItem}
      >
        <motion.div 
          className="flex items-center gap-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-8 w-8" />
          </motion.div>
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-4 w-24" />
          </motion.div>
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-8 w-8" />
          </motion.div>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-8 w-16" />
          </motion.div>
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-8 w-12" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* PDF page skeleton */}
      <motion.div 
        className="flex-1 flex flex-col items-center space-y-4"
        variants={staggerItem}
      >
        <motion.div 
          className="w-full max-w-2xl space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Simulate PDF page with some highlight areas */}
          <motion.div 
            className="relative"
            variants={staggerItem}
          >
            <motion.div animate={skeletonPulse}>
              <Skeleton className="w-full h-96 rounded-lg" />
            </motion.div>
            
            {/* Simulate form field highlights with stagger */}
            <motion.div 
              className="absolute inset-4 space-y-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={staggerItem} animate={skeletonPulse}>
                <Skeleton className="h-6 w-32" />
              </motion.div>
              <motion.div variants={staggerItem} animate={skeletonPulse}>
                <Skeleton className="h-6 w-48" />
              </motion.div>
              <motion.div variants={staggerItem} animate={skeletonPulse}>
                <Skeleton className="h-6 w-24" />
              </motion.div>
              <motion.div 
                className="mt-8"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={staggerItem} animate={skeletonPulse}>
                  <Skeleton className="h-6 w-40" />
                </motion.div>
                <motion.div variants={staggerItem} animate={skeletonPulse}>
                  <Skeleton className="h-6 w-28" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Loading text with animation */}
          <motion.div 
            className="text-center space-y-2"
            variants={staggerItem}
          >
            <motion.div animate={skeletonPulse}>
              <Skeleton className="h-4 w-48 mx-auto" />
            </motion.div>
            <motion.div animate={skeletonPulse}>
              <Skeleton className="h-3 w-64 mx-auto" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  /**
   * Enhanced form panel loading skeleton with stagger animations
   */
  const renderFormSkeleton = () => (
    <motion.div 
      className="h-full flex flex-col"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Form header skeleton */}
      <motion.div 
        className="border-b p-4 space-y-3"
        variants={staggerItem}
      >
        <motion.div 
          className="flex items-center justify-between"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="flex items-center gap-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem} animate={skeletonPulse}>
              <Skeleton className="h-5 w-5" />
            </motion.div>
            <motion.div variants={staggerItem} animate={skeletonPulse}>
              <Skeleton className="h-5 w-24" />
            </motion.div>
            <motion.div variants={staggerItem} animate={skeletonPulse}>
              <Skeleton className="h-5 w-12" />
            </motion.div>
          </motion.div>
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-8 w-16" />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="flex items-center gap-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem} animate={skeletonPulse}>
              <Skeleton className="h-4 w-4" />
            </motion.div>
            <motion.div variants={staggerItem} animate={skeletonPulse}>
              <Skeleton className="h-4 w-20" />
            </motion.div>
            <motion.div variants={staggerItem} animate={skeletonPulse}>
              <Skeleton className="h-5 w-10" />
            </motion.div>
          </motion.div>
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-4 w-px" />
          </motion.div>
          <motion.div variants={staggerItem} animate={skeletonPulse}>
            <Skeleton className="h-4 w-32" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Form fields skeleton */}
      <motion.div 
        className="flex-1 p-4 space-y-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="p-3 space-y-3">
              <motion.div 
                className="flex items-center gap-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={staggerItem} animate={skeletonPulse}>
                  <Skeleton className="h-4 w-32" />
                </motion.div>
                <motion.div variants={staggerItem} animate={skeletonPulse}>
                  <Skeleton className="h-5 w-10" />
                </motion.div>
              </motion.div>
              <motion.div animate={skeletonPulse}>
                <Skeleton className="h-9 w-full" />
              </motion.div>
            </Card>
          </motion.div>
        ))}
        
        {/* Additional page section */}
        <motion.div 
          className="pt-4"
          variants={staggerItem}
        >
          <motion.div animate={skeletonPulse} className="mb-4">
            <Skeleton className="h-6 w-20" />
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`page2-${index}`}
                variants={staggerItem}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="mb-4"
              >
                <Card className="p-3 space-y-3">
                  <motion.div 
                    className="flex items-center gap-2"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div variants={staggerItem} animate={skeletonPulse}>
                      <Skeleton className="h-4 w-28" />
                    </motion.div>
                    <motion.div variants={staggerItem} animate={skeletonPulse}>
                      <Skeleton className="h-5 w-10" />
                    </motion.div>
                  </motion.div>
                  <motion.div animate={skeletonPulse}>
                    <Skeleton className="h-9 w-full" />
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  /**
   * Full dashboard loading skeleton
   */
  const renderDashboardSkeleton = () => (
    <div className="h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="h-16 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1">
          {renderPdfSkeleton()}
        </div>
        <div className="flex-1">
          {renderFormSkeleton()}
        </div>
      </div>
    </div>
  );

  // Render appropriate skeleton based on type
  switch (type) {
    case 'pdf':
      return renderPdfSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    default:
      return null;
  }
}