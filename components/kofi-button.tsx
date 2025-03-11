"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { HeartHandshake } from "lucide-react";

interface KofiButtonProps {
  username: string;
}

export const KofiButton: React.FC<KofiButtonProps> = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button
        color="primary"
        variant="flat"
        onClick={handleOpen}
        className="text-sm font-normal"
        startContent={<HeartHandshake size={18} />}
      >
        Support
      </Button>

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

export default KofiButton; 