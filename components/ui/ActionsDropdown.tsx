"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  danger?: boolean;
  disabled?: boolean;
  confirmMessage?: string;
}

export interface ActionsDropdownProps {
  items: (ActionItem | false | null | undefined)[];
  align?: "right" | "left";
  buttonClassName?: string;
  buttonTitle?: string;
}

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  items,
  align = "right",
  buttonClassName = "",
  buttonTitle = "Actions",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  }>({});
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter out falsy items
  const validItems = items.filter(Boolean) as ActionItem[];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMenuHeight = Math.max(120, validItems.length * 38 + 16);

    const openUpwards = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

    if (align === "left") {
      setCoords({
        top: openUpwards ? undefined : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
        left: Math.max(8, rect.left),
      });
    } else {
      setCoords({
        top: openUpwards ? undefined : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
  }, [align, validItems.length]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleItemClick = (e: React.MouseEvent, item: ActionItem) => {
    e.stopPropagation();
    if (item.disabled) return;

    if (item.confirmMessage) {
      const confirmed = window.confirm(item.confirmMessage);
      if (!confirmed) {
        setIsOpen(false);
        return;
      }
    }

    setIsOpen(false);
    if (item.onClick) {
      item.onClick();
    }
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    // Close on any scroll event (internal table scrolling or page scrolling)
    const handleScroll = (e: Event) => {
      // If scroll occurs inside the menu itself, ignore
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    const handleResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  if (validItems.length === 0) {
    return null;
  }

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      className="fixed z-[9999] min-w-[185px] max-w-[calc(100vw-24px)] sm:max-w-[250px] bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 overflow-hidden text-xs font-semibold select-none animate-in fade-in duration-100"
      style={{
        top: coords.top !== undefined ? `${coords.top}px` : undefined,
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
        left: coords.left !== undefined ? `${coords.left}px` : undefined,
        right: coords.right !== undefined ? `${coords.right}px` : undefined,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
        <span>Actions</span>
        <span className="text-[9px] font-normal lowercase opacity-70">menu</span>
      </div>

      <div className="py-0.5 space-y-0.5 max-h-[280px] overflow-y-auto">
        {validItems.map((item, idx) => {
          const itemClasses = `w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-xs font-bold ${
            item.disabled
              ? "opacity-40 cursor-not-allowed"
              : item.danger
              ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100"
              : "text-slate-700 hover:bg-slate-100 hover:text-royal-900 active:bg-slate-200"
          }`;

          if (item.href) {
            return (
              <a
                key={idx}
                role="menuitem"
                href={item.href}
                target={item.target || "_blank"}
                rel={item.rel || "noopener noreferrer"}
                onClick={(e) => handleItemClick(e, item)}
                className={itemClasses}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </a>
            );
          }

          return (
            <button
              key={idx}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={(e) => handleItemClick(e, item)}
              className={itemClasses}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="inline-block relative">
      <button
        ref={buttonRef}
        type="button"
        title={buttonTitle}
        aria-label={buttonTitle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-royal-900 transition shadow-xs focus:outline-none focus:ring-2 focus:ring-royal-500 touch-manipulation ${
          isOpen ? "bg-slate-100 text-royal-900 ring-2 ring-royal-500" : ""
        } ${buttonClassName}`}
      >
        <Icon name="more-vertical" className="w-4 h-4 text-current" />
      </button>

      {mounted && isOpen && typeof document !== "undefined" && createPortal(menuContent, document.body)}
    </div>
  );
};

export default ActionsDropdown;
