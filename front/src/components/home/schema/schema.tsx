"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import OutlookIcon from "./outlook-icon";
import { FolderInput, ReplyAll, Send, Tag } from "lucide-react";
import styles from "./schema.module.css";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div ref={ref} className={cn(styles.circle, className)}>
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AppSchema({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.wrapper}>
      <Circle className={styles.circleLarge}>
        <span className={styles.logo}>L</span>
      </Circle>
      <div className={cn(styles.container, className)} ref={containerRef}>
        <div className={styles.layout}>
          <div className={styles.columnSingle}>
            <Circle ref={div7Ref}>
              <OutlookIcon className={styles.outlook} />
            </Circle>
          </div>
          <div className={styles.columnLogo}>
            <Circle ref={div6Ref} className={styles.circleLarge}>
              <span className={styles.logo}>L</span>
            </Circle>
          </div>
          <div className={styles.columnStack}>
            <Circle ref={div1Ref}>
              <Tag />
            </Circle>
            <Circle ref={div2Ref}>
              <FolderInput />
            </Circle>
            <Circle ref={div3Ref}>
              <Send />
            </Circle>
            <Circle ref={div4Ref}>
              <ReplyAll />
            </Circle>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div6Ref}
          duration={6}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div6Ref}
          duration={6}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div6Ref}
          duration={6}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div4Ref}
          toRef={div6Ref}
          duration={6}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div6Ref}
          toRef={div7Ref}
          duration={6}
        />
      </div>
    </div>
  );
}
