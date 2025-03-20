"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

interface InfoModalProps {
  open: boolean
  onClose: () => void
}

export default function InfoModal({ open, onClose }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">String Art Guide - Help</DialogTitle>
          <DialogDescription>Learn how to use the String Art Guide application</DialogDescription>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-medium mb-2">What is String Art?</h3>
            <p>
              String art is a technique that involves creating patterns or images by stringing colored threads between
              nails or pins arranged on a surface (usually a wooden board). The final result depends on the precise
              order in which the threads are strung between the numbered nails.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">How to Use This Application</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Load Instructions:</strong> Start by uploading a text file containing string art instructions.
                The file should list the sequence of nail numbers to connect.
              </li>
              <li>
                <strong>Follow Instructions:</strong> The app will display the current thread color and the next nail
                number to connect to. Use the Next and Previous buttons to navigate through the instructions.
              </li>
              <li>
                <strong>Track Progress:</strong> The progress bar shows your overall completion. You can save your
                progress at any time by clicking "Save to File".
              </li>
              <li>
                <strong>Use the Preview:</strong> The visual preview shows a representation of your project with nails
                arranged in a circle and threads displayed as lines.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">File Format</h3>
            <p>The instruction file should follow this format:</p>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
              {`Thread: [R, G, B]
nail_number_1
nail_number_2
nail_number_3
...

Thread: [R, G, B]
nail_number_1
nail_number_2
...`}
            </pre>
            <p className="mt-2">
              Where [R, G, B] represents the RGB color values for the thread (e.g., [255, 0, 0] for red).
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Saving and Loading Projects</h3>
            <p>You can save your progress at any time and continue later:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li>Enter a name for your project in the "Project Name" field</li>
              <li>Click "Save to File" to download a JSON file with your progress</li>
              <li>When you want to continue, click "Load from File" and select your saved file</li>
              <li>Your project will be restored exactly where you left off</li>
            </ol>
            <p className="mt-2">
              The saved file contains all your project data, including the current position, timer, and all thread
              information.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Preparing Your Materials</h3>
            <p>Before starting your string art project, make sure to prepare:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Wooden Board:</strong> A smooth surface where you'll hammer the nails.
              </li>
              <li>
                <strong>Nails or Pins:</strong> Make sure you have enough for the pattern (check the highest nail number
                in your instructions).
              </li>
              <li>
                <strong>Thread Colors:</strong> After loading your instruction file, check the "Required Thread Colors"
                section to see all the colors you'll need for your project.
              </li>
              <li>
                <strong>Tools:</strong> Hammer, scissors, and possibly pliers for handling nails.
              </li>
            </ul>
            <p className="mt-2">
              The application will show you a summary of all thread colors needed when you load your file, so you can
              prepare all materials before starting.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Features</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Auto Advance:</strong> Automatically move to the next instruction after a set delay.
              </li>
              <li>
                <strong>Dark Mode:</strong> Toggle between light and dark themes for different lighting conditions.
              </li>
              <li>
                <strong>Timer:</strong> Track how long you've been working on your project.
              </li>
              <li>
                <strong>Fullscreen Mode:</strong> Focus on your instructions without distractions.
              </li>
              <li>
                <strong>Keyboard Shortcuts:</strong> Use arrow keys or N/P to navigate, S to save, etc.
              </li>
              <li>
                <strong>File-based Saving:</strong> Save your progress to a file that you can backup or transfer to
                another device.
              </li>
            </ul>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

