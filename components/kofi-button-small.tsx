"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { HeartHandshake } from "lucide-react";

interface KofiButtonSmallProps {
  username: string;
}

export const KofiButtonSmall: React.FC<KofiButtonSmallProps> = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-primary text-sm font-medium flex items-center gap-1"
        aria-label="Support"
      >
        <HeartHandshake size={16} />
        <span className="hidden xs:inline">Support</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Support this project</ModalHeader>
          <ModalBody className="p-0">
            <iframe 
              id="kofiframe" 
              src={`https://ko-fi.com/${username}/?hidefeed=true&widget=true&embed=true&preview=true`} 
              style={{ border: 'none', width: '100%', padding: '4px', background: '#f9f9f9' }} 
              height="712" 
              title={username}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KofiButtonSmall; 