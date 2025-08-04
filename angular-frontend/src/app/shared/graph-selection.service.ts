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
 */
@Injectable()
export class GraphSelectionService {
  private readonly _isSelectionMode = signal(false);
  private readonly _selectionStartX = signal<number | null>(null);
  private readonly _selectionEndX = signal<number | null>(null);
  private readonly _isSelecting = signal(false);
  private readonly _graphHeight = signal<number>(600);
  
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
   * Starts a new selection at the specified x-coordinate
   */
  startSelection(x: number): void {
    this._selectionStartX.set(x);
    this._selectionEndX.set(x);
    this._isSelecting.set(true);
  }
  
  /**
   * Updates the selection end position during drag operation
   */
  updateSelection(x: number): void {
    if (this._isSelecting()) {
      this._selectionEndX.set(x);
    }
  }
  
  /**
   * Finalizes the current selection
   */
  finishSelection(): void {
    this._isSelecting.set(false);
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