import { Request, Response } from 'express';
import Contact from '../models/Contact';
import User from '../models/User';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase.config';


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const uploadPhoto = async (fileBuffer: Buffer, fileName: string) => {
    const storageRef = ref(storage, `contacts/${fileName}`);
    await uploadBytes(storageRef, fileBuffer, {
        contentType: "image/jpeg",
        customMetadata: {
            "Content-Disposition": "inline"
        }
    });
    return await getDownloadURL(storageRef);
};


export const createContact = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const { firstName, lastName, contactNumber, emailAddress } = req.body;
        if (!firstName || !lastName || !contactNumber || !emailAddress) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let photoUrl: string | null = null;

        // Updated photo upload logic
        if (req.file) {
            try {
                const fileName = `${Date.now()}-${req.file.originalname}`;
                photoUrl = await uploadPhoto(req.file.buffer, fileName);
            } catch (error) {
                console.error("Error uploading photo:", error);
                photoUrl = null;
            }
        }

        const contact = new Contact({
            firstName,
            lastName,
            contactNumber,
            emailAddress,
            owner: userId,
            photo: photoUrl,
        });

        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getContacts = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const contacts = await Contact.find({
            $or: [
                { owner: userId },
                { 'sharedWith.userId': String(userId) }
            ]
        });

        const transformedContacts = contacts.map(contact => {
            const contactObj = contact.toObject();
            return contactObj;
        });

        res.json(transformedContacts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getContact = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const contact = await Contact.findOne({
            _id: req.params.id,
            $or: [
                { owner: userId },
                { 'sharedWith.userId': String(userId) }
            ]
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        const contactObj = contact.toObject();
        res.json(contactObj);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const contact = await Contact.findOne({
            _id: req.params.id,
            owner: userId,
        });

        if (!contact) {
            return res.status(404).json({ error: "Contact not found or unauthorized" });
        }

        let photoUrl = contact.photo;

        // Updated photo upload logic
        if (req.file) {
            try {
                const fileName = `${Date.now()}-${req.file.originalname}`;
                photoUrl = await uploadPhoto(req.file.buffer, fileName);
            } catch (error) {
                console.error("Error uploading new photo:", error);
                return res.status(500).json({ error: "Failed to upload new photo" });
            }
        }

        // Update contact fields
        Object.assign(contact, req.body, { photo: photoUrl });
        await contact.save();

        res.json(contact);
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const contact = await Contact.findOneAndDelete({
            _id: req.params.id,
            owner: userId
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found or unauthorized' });
        }

        res.json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const shareContact = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { email } = req.body;
        const shareWithUser = await User.findOne({ email });
        if (!shareWithUser) {
            return res.status(404).json({ message: 'User with this email not found' });
        }
        const contact = await Contact.findOne({
            _id: req.params.id,
            owner: userId
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found or unauthorized' });
        }
        const isAlreadyShared = contact.sharedWith.some(
            share => share.email.toString() === (email as string)
        );

        if (isAlreadyShared) {
            return res.status(400).json({ message: 'Contact already shared with this user' });
        }
        const shareWithUserEmail = shareWithUser.email as string;
        contact.sharedWith.push({
            userId: shareWithUser._id as unknown as string,
            email: shareWithUserEmail
        });

        await contact.save();
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const unshareContact = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { email } = req.body;

        const contact = await Contact.findOne({
            _id: req.params.id,
            owner: userId
        });


        if (!contact) {
            return res.status(404).json({ error: 'Contact not found or unauthorized' });
        }

        contact.sharedWith = contact.sharedWith.filter(share => share.email !== email);
        await contact.save();

        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}; 