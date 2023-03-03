import joi from "joi";



export const updateSchema = {
    body: joi.object({
      username: joi.string().alphanum().min(3).max(20).required().messages({
        "any.required":"username field is required",
        "string.empty":"Please fill your username field"
      }),
      age:joi.number().integer().min(16).max(120).required().messages({
        "number.min":"your age should be greater than 16 years",
        "number.max":"your age should be less than 120 years",
      }),
      gender:joi.string().valid('male',"female").messages({
        "any.only":"gender field must be male or female"
      })
    }).required(),
    headers: joi.object({
        'authorization': joi.string().required().messages({
            "any.required":"headers must have  abearerkey"
        })
    }).options({ allowUnknown: true })
  };
  