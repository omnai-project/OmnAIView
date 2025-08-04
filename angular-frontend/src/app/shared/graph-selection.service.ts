import { Injectable, computed, signal } from '@angular/core';

export interface SelectionPoint {
  x: number;
  y: number;
}

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Service for managing graph selection state and interactions
 * Provides functionality for rectangular area selection on time-series graphs
 * Supports both mouse and touch interactions with movement-based click/drag detection
 */
@Injectable()
export class GraphSelectionService {
  private readonly _isSelectionMode = signal(false);
  private readonly _selectionStartX = signal<number | null>(null);
  private readonly _selectionEndX = signal<number | null>(null);
  private readonly _isSelecting = signal(false);
  private readonly _graphHeight = signal<number>(600);
  
  // Track initial pointer position for drag detection
  private _initialPointerX: number | null = null;
  private _initialPointerY: number | null = null;
  
  // Minimum movement distance to distinguish drag from click (in pixels)
  private readonly DRAG_THRESHOLD = 5;
  
  readonly isSelectionMode = this._isSelectionMode.asReadonly();
  readonly selectionStartX = this._selectionStartX.asReadonly();
  readonly selectionEndX = this._selectionEndX.asReadonly();
  readonly isSelecting = this._isSelecting.asReadonly();
  
  /**
   * Computed selection rectangle coordinates covering full graph height
   * Returns null if no selection is active
   */
  readonly selectionRect = computed(() => {
    const startX = this._selectionStartX();
    const endX = this._selectionEndX();
    
    if (startX === null || endX === null) return null;
    
    return {
      x: Math.min(startX, endX),
      y: 0, 
      width: Math.abs(endX - startX),
      height: this._graphHeight() 
    } as SelectionRect;
  });
  
  /**
   * Toggles selection mode on/off and clears any existing selection
   */
  toggleSelectionMode(): void {
    this._isSelectionMode.update(v => !v);
    this.clearSelection();
  }
  
  /**
   * Updates the graph height for selection rectangle calculation
   */
  setGraphHeight(height: number): void {
    this._graphHeight.set(height);
  }
  
  /**
   * Starts a potential selection at the specified coordinates
   * Stores initial position but doesn't start selection until drag threshold is exceeded
   */
  startPotentialSelection(x: number, y: number): void {
    this._initialPointerX = x;
    this._initialPointerY = y;
    // Don't start actual selection yet - wait for drag threshold
  }
  
  /**
   * Updates the selection position and starts actual selection if drag threshold exceeded
   */
  updateSelection(x: number, y: number): void {
    if (this._initialPointerX === null || this._initialPointerY === null) return;
    
    const deltaX = Math.abs(x - this._initialPointerX);
    const deltaY = Math.abs(y - this._initialPointerY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Start actual selection only if movement exceeds threshold
    if (!this._isSelecting() && distance >= this.DRAG_THRESHOLD) {
      this._selectionStartX.set(this._initialPointerX);
      this._selectionEndX.set(this._initialPointerX);
      this._isSelecting.set(true);
    }
    
    // Update selection if we're already selecting
    if (this._isSelecting()) {
      this._selectionEndX.set(x);
    }
  }
  
  /**
   * Finishes the current selection or clears existing selection on simple click
   * Returns true if this was a drag operation, false if it was a click
   */
  finishSelection(): boolean {
    const wasDragging = this._isSelecting();
    
    if (wasDragging) {
      // This was a drag operation - finalize selection
      this._isSelecting.set(false);
    } else {
      // This was a click - clear any existing selection
      this.clearSelection();
    }
    
    // Reset initial position tracking
    this._initialPointerX = null;
    this._initialPointerY = null;
    
    return wasDragging;
  }
  
  /**
   * Clears all selection state
   */
  clearSelection(): void {
    this._selectionStartX.set(null);
    this._selectionEndX.set(null);
    this._isSelecting.set(false);
  }
}