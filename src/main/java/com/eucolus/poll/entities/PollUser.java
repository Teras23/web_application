package com.eucolus.poll.entities;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = {"email"}))
public class PollUser {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String googleUid;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGoogleUid() {
        return googleUid;
    }

    public void setGoogleUid(String googleUid) {
        this.googleUid = googleUid;
    }

    @Override
    public boolean equals(Object obj) {
        if(!(obj instanceof PollUser)) {
            return false;
        }
        PollUser user = (PollUser)obj;
        if(this.googleUid.equals(user.googleUid)) {
            return true;
        }
        else if(this.email.equals(user.email)) {
            return true;
        }
        return false;
    }
}
