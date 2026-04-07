import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group"
      [ngClass]="{
        'border-primary-300 bg-primary-50/50 dark:border-primary-600 dark:bg-primary-900/20': isDragging,
        'border-surface-300 hover:border-primary-400 bg-surface-50 dark:border-surface-600 dark:bg-surface-800/50': !isDragging
      }"
      (dragover)="onDragOver($event)"
      (dragleave)="isDragging = false"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <input
        #fileInput
        type="file"
        [accept]="accept"
        (change)="onFileSelected($event)"
        class="hidden"
      />

      @if (selectedFile) {
        <div class="flex items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center">
            <span class="text-2xl">📄</span>
          </div>
          <div class="text-left">
            <p class="font-medium text-surface-800 dark:text-surface-200">{{ selectedFile.name }}</p>
            <p class="text-xs text-surface-500">{{ formatSize(selectedFile.size) }}</p>
          </div>
          <button
            (click)="removeFile($event)"
            class="ml-4 p-2 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/30 text-danger-500 transition-colors"
          >
            ✕
          </button>
        </div>
      } @else {
        <div class="space-y-3">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="text-3xl">📁</span>
          </div>
          <div>
            <p class="text-surface-700 dark:text-surface-300 font-medium">
              Drag & drop your file here
            </p>
            <p class="text-sm text-surface-400 mt-1">
              or <span class="text-primary-500 font-semibold">browse</span> to upload
            </p>
          </div>
          @if (hint) {
            <p class="text-xs text-surface-400 dark:text-surface-500">{{ hint }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class FileUploadComponent {
  @Input() accept = '.pdf,image/*';
  @Input() hint = 'Supported: PDF, JPG, PNG (max 10MB)';
  @Output() fileSelected = new EventEmitter<File>();

  selectedFile: File | null = null;
  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile(input.files[0]);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private selectFile(file: File): void {
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }
}
