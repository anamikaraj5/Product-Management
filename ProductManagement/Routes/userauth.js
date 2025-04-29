import {Router} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import {authenticate} from '../Middleware/authenticate.js'
import { users } from '../schemas/schema1.js'
import { upload } from '../Middleware/upload1.js'
import { products } from '../schemas/schema2.js'


dotenv.config()

const userauth=Router()

const convertToBase64=(buffer)=>{
    return buffer.toString("base64")
}

//signup page
userauth.post('/signup', async (req, res) => {
    try {
        const { FullName, UserId, Email, Password } = req.body;

        const existingUser = await users.findOne({ email:Email })
        if (existingUser) {
            return res.status(400).send("User already exists")
        }

        const hashedPassword = await bcrypt.hash(Password, 10)

        const newUser = new users({
            name: FullName,
            roles: 'user',
            userid: UserId,
            email: Email,
            password: hashedPassword
        })
        await newUser.save();

        res.status(201).send("Successful Registration");
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})



//login page
userauth.post('/login', async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const result = await users.findOne({ email: Email });
        if (!result) {
            return res.status(400).send("Email not registered");
        }

        const compare1 = await bcrypt.compare(Password, result.password);
        if (!compare1) {
            return res.status(401).send("Unauthorized access");
        }

        let role = result.roles

        if (Email === "admin@gmail.com" && Password === "admin") {
            role = "admin";
        }

        const token = jwt.sign({ email: Email, role: role },process.env.SECRET_KEY,{ expiresIn: '1h' })

        console.log(token);
        res.cookie('userauthtoken', token, { httpOnly: true });
        res.status(200).json({ message: "Login Successful", role: role });
    } 
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


//Add a Product
userauth.post('/addproduct',authenticate,upload.single('ProductImage'),async(req,res)=>
    {
        try{
    
            if(req.Role=='user')
            {
                const {ProductName,ProductId,Price,Category,Description} = req.body
               
                const result = await products.findOne({productid:ProductId})  
    
                if(result)
                    {
                    
                        res.status(400).json({message:"Product already added!!!"})
                    }
                else
                    {

                        let imageBase64 = null
                        if(req.file)
                        {
                            imageBase64=`data:image/png;base64,${convertToBase64(req.file.buffer)}`
                        }
                
                        const newproduct = new products(
                            {
                                
                                productname:ProductName,
                                productid:ProductId,
                                price:Price,
                                category:Category,
                                description:Description,
                                image:imageBase64,
                                useremail:req.Email
                        
                            }
                        )
            
                        await newproduct.save()
                        res.status(201).json({message:"Successfully added a Product!!!"})
              
                    }
            }
    
            else
           {
                res.status(401).json({message:"Unauthorized access"})
           }
        }
    
        
        catch
        {
            res.status(500).json({message:"Internal Server error"})
        }
        
        
      
    })


//View a Product by ProductId
userauth.get('/viewproduct',async(req,res)=>
    {
        try{
                const product_id=req.query.productid 
                const result = await products.findOne({productid:product_id})

                if(result)
                {
                    res.json(result)
                    console.log(result)
                
                }
                else
                {
                    res.status(400).json({message:"Product not found!!!!"})
                }
            }
        catch
        {
            res.status(500).json({message:"Internal server error"})
        }
})


//View all Products
userauth.get('/viewallproduct',async(req,res)=>
    {
        try{
                const result = await products.find()

                console.log("Products found:", result)
                if(result && result.length > 0)
                {
                    console.log(result)
                    res.json(result)
                    
                
                }
                else
                {
                    res.status(400).json({message:"Products not found!!!!"})
                }
            }
        catch
        {
            res.status(500).json({message:"Internal server error"})
        }
})


//Update a Product
userauth.put('/updateproduct', authenticate,upload.single('ProductImage'), async (req, res) => {
    try {
        const { ProductName, ProductId, Price, Category, Description} = req.body;
        const userEmail = req.Email;
        const userRole = req.Role;

        const product = await products.findOne({ productid: ProductId });

        if (!product) {
            return res.status(400).json({ message: "Product not found!!!" });
        }

        if (userRole === 'user' && product.useremail !== userEmail) {
            return res.status(403).json({ message: "You can only update your own product" });
        }

        product.productname = ProductName
        product.price = Price
        product.category = Category
        product.description = Description;

        if (req.file) {
            const imageBase64 = `data:image/png;base64,${req.file.buffer.toString('base64')}`;
            product.image = imageBase64;
        }

        await product.save();
        res.status(200).json({ message: "Updated successfully..." });
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Delete a Product
userauth.delete('/deleteproduct', authenticate, async (req, res) => {
    try {
        const productId = req.query.pid

        const product = await products.findOne({ productid: productId });

        if (!product) {
            return res.status(404).send("Product not found!");
        }

        if (req.Role === 'admin' || product.useremail === req.Email) {
            await products.deleteOne({ productid: productId });
            return res.status(200).send("Product deleted successfully");
        } 
        else {
            return res.status(403).send("Unauthorized to delete this product");
        }

    } 
    catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
});




//LOGOUT

userauth.get('/logout',(req,res)=>
{
    res.clearCookie('userauthtoken')
    res.status(200).send("Logged out...")
})

export {userauth}